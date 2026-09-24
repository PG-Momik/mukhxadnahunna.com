# How matching works

The filter works on words, not on raw substrings. Checking raw substrings would flag `class` for containing `ass`, and
`Scunthorpe` for containing `cunt`. Instead, the filter normalizes the text, splits it into tokens, and checks each
token against the word lists. It then checks the whole text for phrases.

## 0. Pick the active entries

Every entry in the lexicon is tagged with a language and a strictness. A filter only uses the entries whose language
is turned on and whose strictness is at or below the filter's strictness. The lookup tables for each combination of
options are built once and reused. Postpositions apply at every setting.

In the steps below, "the word list" means the active entries only.

## 1. Normalize

Latin text is normalized as follows:

| Step | Example |
|---|---|
| Unicode NFKC, which turns full-width letters into plain ones | `ＩＤＩＯＴ` → `IDIOT` |
| Lowercase | `IDIOT` → `idiot` |
| Remove zero-width characters | `mu​ji` → `muji` |
| Decode leetspeak: `0 1 3 4 5 7 @ $` → `o i e a s t a s` | `sh1t` → `shit`, `@ss` → `ass` |
| Replace `!` between two letters with `i` | `b!tch` → `bitch`, but `teacher!` is unchanged |

Devanagari text is normalized as follows:

| Step | Example |
|---|---|
| Unicode NFC | composed and decomposed forms become equal |
| Remove zero-width joiners and non-joiners | `मु‍जी` → `मुजी` |
| Remove the nukta (`़`) | `ड़` → `ड` |
| Chandrabindu (`ँ`) → anusvara (`ं`) | both spellings become equal |

## 2. Tokenize

The normalized text is split into runs of letters. A `*` counts as a letter, so `f*ck` stays one token.

A run of three or more single-letter tokens is joined into one. That catches `f u c k` and `f.u.c.k` but leaves
`a b` alone.

Devanagari tokens are kept whole.

## 3. Match each token

For a **Latin** token, the filter first tries the token as it is. If the token ends in a postposition from
`LATIN_SUFFIXES`, it also tries the token with the postposition removed, as long as at least three letters remain. A
candidate matches if any of these checks passes:

1. **Whole word.** Runs of three or more repeated letters are cut to two, and the result is looked up in
   `LATIN_WORDS`.
2. **Stretched word.** All repeated letters are cut to one, and the result is looked up in `LATIN_WORDS`. This check
   only applies to words of four or more letters, which is why `fuuuuck` matches but `aaass` doesn't.
3. **Stem.** The collapsed token starts with an entry from `LATIN_STEMS`.
4. **Wildcard.** If the token contains `*`, each `*` can stand for any one letter, and the token is compared with
   every word and stem. Leading and trailing `*` are removed first, so markdown emphasis like `*sh*t*` still reads as
   `sh*t`.

For a **Devanagari** token, the filter also removes one postposition from `DEVANAGARI_SUFFIXES` if one is present. The
token matches if it appears in `DEVANAGARI_WORDS` or starts with an entry from `DEVANAGARI_STEMS`.

## 4. Match phrases

Each phrase in `LATIN_PHRASES` and `DEVANAGARI_PHRASES` becomes a regular expression. The phrase has to start and end
on a word boundary, and any whitespace can separate its words. The filter runs these expressions over the whole
normalized text, so leetspeak inside a phrase is still caught:

```js
findProfanity("p3sa g@rne taba");   // ["pesa garne"]
```

## 5. Map matches back for censoring

Normalization changes the text: `Sh1t` becomes `shit`, `sh!!t` becomes `shit`, and zero-width characters disappear.
To censor the right characters, the filter records where in the original text each normalized character came from.
A match found in the normalized text is then mapped back to the exact span the user typed. That span is what
`findProfanityMatches` returns and what `censor` masks.

## Why short words match exactly

Stretched-word matching and stem matching are both prefix or fuzzy checks. Used on short words, they cause false
positives, so short words are only matched exactly. For example, `ass` is in `LATIN_WORDS`, but `class`,
`assignment` and `Assam` aren't flagged because none of them is exactly `ass`. The same reasoning is why `shit` is a
whole word rather than a stem: the name **Shitij** starts with it.
