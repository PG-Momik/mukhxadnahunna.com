# The lexicon

The lexicon is the set of word lists the filter checks against. It ships with the package, and you can read it
through the [`lexicon`](./api.md#lexicon) export:

```js
import { lexicon } from "no-nepali-profanity";

lexicon.WORDS.filter((e) => e.language === "romanized" && e.strictness === "standard");
```

## Entries

Every entry has three fields:

```ts
interface LexiconEntry {
  text: string;             // the word, stem or phrase
  language: Language;       // "english" | "romanized" | "devanagari"
  strictness: Strictness;   // the lowest strictness that turns it on
}
```

Entries are grouped into three lists, and each list is matched differently:

| List | Matched how | Example |
|---|---|---|
| `WORDS` | The whole word, with or without a postposition. | `muji` catches `muji` and `mujiko`, not `mujibur`. |
| `STEMS` | Any word that starts with the stem. | `fuck` catches `fucking` and `fucker`. |
| `PHRASES` | The words in order, separated by any whitespace. | `sasto manche` catches `sasto   manche`, not `sasto ra manche`. |

Two more lists hold the postpositions that are removed before a whole-word check: `LATIN_SUFFIXES` (`ko`, `lai`,
`haru`…) and `DEVANAGARI_SUFFIXES` (`को`, `लाई`, `हरू`…).

## Languages

| Language | Contains |
|---|---|
| `"english"` | English profanity and insults. |
| `"romanized"` | Nepali written in Latin letters, and Hindi slang common in Nepal. |
| `"devanagari"` | Anything written in Devanagari. |

## Strictness levels

| Strictness | Contains |
|---|---|
| `"lenient"` | Severe profanity, sexual terms and slurs. |
| `"standard"` | Milder insults that some sites allow, like `idiot`, `murkha`, `sala` and `sasto manche`. |
| `"strict"` | Entries that are offensive but also match ordinary words or names. For example, the stem `rand` also matches *Randip*, and `cond` matches *conditions*. |

A filter set to one level uses the entries at that level and every level below it.

## What's deliberately left out

- **Words that are also common names**, or the start of names, unless they're whole words that can't be a name.
- **Caste names and surnames.** A word list can't tell a slur from someone's name.
- **Everyday words that are only insulting in context**, like *fohor* (dirty), *lato* (mute) or *kukur* (dog).

To suggest additions or removals, see [Contributing](./contributing.md).

## Flat lists

For convenience, the lexicon also exports plain string lists of every entry in one script, at every strictness:
`LATIN_WORDS`, `LATIN_STEMS`, `LATIN_PHRASES`, `DEVANAGARI_WORDS`, `DEVANAGARI_STEMS` and `DEVANAGARI_PHRASES`.
