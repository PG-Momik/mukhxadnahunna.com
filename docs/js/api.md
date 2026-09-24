# API reference

```ts
import {
  check,
  containsProfanity,
  findProfanity,
  findProfanityMatches,
  censor,
  createFilter,
  tokenize,
  lexicon,
  type FilterOptions,
  type CensorOptions,
  type ProfanityCheck,
  type ProfanityMatch,
  type ProfanityFilter,
  type Language,
  type Strictness,
} from "no-nepali-profanity";
```

## Options

`check`, `containsProfanity`, `findProfanity`, `findProfanityMatches`, `censor` and `createFilter` all take the same
optional `options` object:

```ts
interface FilterOptions {
  languages?: readonly Language[];   // default: all three
  strictness?: Strictness;           // default: "standard"
}

type Language = "english" | "romanized" | "devanagari";
type Strictness = "lenient" | "standard" | "strict";
```

### `languages`

Sets which word lists are checked. Leave a language out to turn it off.

| Value | Checks |
|---|---|
| `"english"` | English profanity (`fuck`, `bitch`, `idiot`…). |
| `"romanized"` | Nepali written in Latin letters, plus Hindi slang common in Nepal (`muji`, `chutiya`, `sasto manche`…). |
| `"devanagari"` | Nepali written in Devanagari (`मुजी`, `सस्तो मान्छे`…). |

```js
findProfanity("fuck muji मुजी", { languages: ["romanized"] });               // ["muji"]
findProfanity("fuck muji मुजी", { languages: ["english", "devanagari"] });   // ["fuck", "मुजी"]
```

An empty array turns every language off, so nothing is ever flagged.

### `strictness`

Sets how much is caught. Each level includes everything from the levels below it.

| Level | Adds |
|---|---|
| `"lenient"` | Severe profanity and slurs only. |
| `"standard"` (default) | Milder insults: `idiot`, `stupid`, `murkha`, `sala`, `kutta`, `sasto manche`… |
| `"strict"` | Stems that also start ordinary words or names: `rand`, `cond`, `kand`, `lund`. Catches more inflected forms, but flags words like `Randip`, `conditions` and `Kandel`. |

```js
containsProfanity("you idiot", { strictness: "lenient" });        // false
containsProfanity("you idiot");                                   // true
findProfanity("terms and conditions");                            // []
findProfanity("terms and conditions", { strictness: "strict" });  // ["conditions"]
```

Use `"strict"` only when a human reviews what gets flagged, for example as a moderation queue rather than as an
automatic block.

An unknown language or strictness throws a `TypeError`.

## `check(text, options?)`

```ts
function check(text: string, options?: FilterOptions): ProfanityCheck

interface ProfanityCheck {
  readonly text: string;               // the text that was checked
  readonly hasProfanity: boolean;      // same as containsProfanity
  readonly words: string[];            // same as findProfanity
  readonly matches: ProfanityMatch[];  // same as findProfanityMatches
  censor(options?: CensorOptions): string;
}
```

Scans the text once and returns everything the other functions would. `censor()` on the result reuses that scan,
so you can check and censor without scanning twice:

```js
const result = check("you muji, F.U.C.K");

result.hasProfanity;         // true
result.words;                // ["muji", "fuck"]
result.matches[0];           // { text: "muji", normalized: "muji", start: 4, end: 8 }
result.censor();             // "you ****, *******"

check("you muji").censor();  // "you ****"
```

## `containsProfanity(text, options?)`

```ts
function containsProfanity(text: string, options?: FilterOptions): boolean
```

Returns `true` if `text` contains at least one active word, stem or phrase. It returns `false` for an empty string.

This is `findProfanity(text, options).length > 0`. It doesn't stop at the first match, so it takes about as long as
`findProfanity`.

```js
containsProfanity("Great teacher!");   // false
containsProfanity("IDIOT");            // true
```

## `findProfanity(text, options?)`

```ts
function findProfanity(text: string, options?: FilterOptions): string[]
```

Returns the tokens and phrases that matched, without duplicates. It returns `[]` when the text is clean.

Each result is the token **after normalization**, not the dictionary word it matched, and not the original text:

- Letters are lowercased, and full-width letters are converted to plain ones.
- Leetspeak is decoded, so `sh1t` becomes `shit`.
- A `!` between letters becomes `i`, so `sh!t` becomes `shit`.
- Spelled-out letters are joined, so `f.u.c.k` becomes `fuck`.
- `*` wildcards stay as they are, so `f*ck` stays `f*ck`.
- Stretched letters stay as they are, so `fuuuuck` stays `fuuuuck`.
- Postpositions stay attached, so `mujiko` stays `mujiko`.
- A phrase match is returned as the whole phrase, for example `pesa garne`.

```js
findProfanity("f.u.c.k this sh1t");    // ["fuck", "shit"]
findProfanity("fuuuuck");              // ["fuuuuck"]
findProfanity("gedaharu");             // ["gedaharu"]
findProfanity("मु‍जी");                 // ["मुजी"] (zero-width joiner removed)
findProfanity("p3sa g@rne taba");      // ["pesa garne"]
findProfanity("chaak ko pwal");        // ["chaak", "chaak ko pwal"]
```

The last example returns two results: `chaak` is listed as a single word, and it is also part of a listed phrase.

To find *where* each match is, use `findProfanityMatches`.

## `findProfanityMatches(text, options?)`

```ts
function findProfanityMatches(text: string, options?: FilterOptions): ProfanityMatch[]

interface ProfanityMatch {
  text: string;         // exactly what the user typed, e.g. "F.U.C.K"
  normalized: string;   // the normalized form, e.g. "fuck"
  start: number;        // start index in the input
  end: number;          // end index in the input, exclusive
}
```

Returns every match with its position in the original text, sorted by position. Unlike `findProfanity`, repeated
words are listed once per occurrence.

`start` and `end` are UTF-16 indexes, the same as `String.prototype.slice` uses, so
`text.slice(match.start, match.end) === match.text`.

```js
findProfanityMatches("F.U.C.K this sh1t, muji. MUJI");
// [
//   { text: "F.U.C.K", normalized: "fuck", start: 0,  end: 7 },
//   { text: "sh1t",    normalized: "shit", start: 13, end: 17 },
//   { text: "muji",    normalized: "muji", start: 19, end: 23 },
//   { text: "MUJI",    normalized: "muji", start: 25, end: 29 },
// ]
```

When a phrase contains a listed word, both are returned, with the longer match first:

```js
findProfanityMatches("chaak ko pwal");
// [
//   { text: "chaak ko pwal", normalized: "chaak ko pwal", start: 0, end: 13 },
//   { text: "chaak",         normalized: "chaak",         start: 0, end: 5 },
// ]
```

## `censor(text, options?)`

```ts
function censor(text: string, options?: FilterOptions & CensorOptions): string

interface CensorOptions {
  mask?: string;                                  // default "*"
  replace?: (match: ProfanityMatch) => string;    // takes precedence over mask
}
```

Returns the text with every match replaced. Everything else is left as it was.

- `mask` replaces each visible character of a match, except whitespace.
- `replace` receives each match and returns its replacement.
- Overlapping matches are merged into one before they're replaced.

```js
censor("you muji");                                  // "you ****"
censor("F.U.C.K this Sh1t!");                        // "******* this ****!"
censor("you muji", { mask: "#" });                   // "you ####"
censor("you muji", { replace: () => "[censored]" }); // "you [censored]"
censor("fuck muji", { languages: ["romanized"] });   // "fuck ****"
```

An empty `mask` throws a `TypeError`. See [Censoring](./censoring.md) for more.

## `createFilter(options?)`

```ts
function createFilter(options?: FilterOptions): ProfanityFilter

interface ProfanityFilter {
  check(text: string): ProfanityCheck;
  containsProfanity(text: string): boolean;
  findProfanity(text: string): string[];
  findProfanityMatches(text: string): ProfanityMatch[];
  censor(text: string, options?: CensorOptions): string;
}
```

Builds a filter with fixed options. The lookup tables for those options are built once, when you call
`createFilter`. Use it when you check a lot of text with the same settings:

```js
import { createFilter } from "no-nepali-profanity";

const filter = createFilter({ languages: ["romanized"], strictness: "lenient" });

filter.containsProfanity("muji");       // true
filter.containsProfanity("murkha");     // false (a "standard" word)
filter.findProfanity("fuck muji");      // ["muji"] (English is off)
filter.censor("fuck muji");             // "fuck ****"
filter.check("muji").censor();          // "****"
```

The top-level functions also cache a filter for each combination of options. Passing
options on every call is fine, but `createFilter` makes the settings explicit and checks them once, up front.

## `tokenize(text)`

```ts
function tokenize(text: string): string[]
```

Returns the tokens that the matcher checks against the word lists. Use it to find out why a word was caught or missed.

```js
tokenize("Great teacher!");    // ["great", "teacher"]
tokenize("f*ck this!");        // ["f*ck", "this"]
tokenize("m u j i ko");        // ["muji", "ko"]
tokenize("सीता कार्की");         // ["सीता", "कार्की"]
```

A run of three or more single letters is joined into one token. That is how `f u c k` and `f.u.c.k` are caught.

## `lexicon`

A namespace containing the word lists. Everything in it is read-only.

**Tagged entries.** Each entry is a `LexiconEntry`:

```ts
interface LexiconEntry {
  text: string;
  language: Language;
  strictness: Strictness;   // the lowest strictness that turns this entry on
}
```

| Export | Matched how |
|---|---|
| `WORDS` | Whole token, after normalization. A trailing postposition is removed first. |
| `STEMS` | The token starts with the stem. For example, `fuck` catches `fucking`. |
| `PHRASES` | Words in sequence, separated by any whitespace. |

```js
import { lexicon } from "no-nepali-profanity";

lexicon.WORDS.filter((e) => e.language === "romanized" && e.strictness === "standard");
```

**Flat lists.** These `readonly string[]` lists hold every entry in one script, at every strictness:

- `LATIN_WORDS`, `LATIN_STEMS` and `LATIN_PHRASES` cover English and Romanized Nepali.
- `DEVANAGARI_WORDS`, `DEVANAGARI_STEMS` and `DEVANAGARI_PHRASES` cover Devanagari.

**Postpositions.** `LATIN_SUFFIXES` (`ko`, `lai`, `haru`…) and `DEVANAGARI_SUFFIXES` (`को`, `लाई`, `हरू`…) are removed
before the whole-word check. They apply at every language and strictness setting.

The matcher builds its lookup tables from these lists, so you can't add your own words at runtime. To change the
lists, see [The lexicon](./lexicon.md).
