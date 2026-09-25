# Changelog

## 0.1.0 (2026-09-25)

First release.

- `containsProfanity`, `findProfanity` and `tokenize`.
- `censor` to mask matches in place, with a custom `mask` character or a `replace` function.
- `check` to scan once, then inspect and censor the result: `check(text).censor()`.
- `findProfanityMatches` to get each match with its position in the original text.
- `createFilter` for reusing one set of options.
- `languages` option to check English, Romanized Nepali and Devanagari separately.
- `strictness` option with three levels: `"lenient"`, `"standard"` (default) and `"strict"`.
- Handles leetspeak, `!` and `*` in place of letters, stretched letters and spelled-out letters.
- Handles Nepali postpositions and plurals in both scripts.
- Multi-word phrases in both scripts.
- A `lexicon` export with every entry tagged by language and strictness.
