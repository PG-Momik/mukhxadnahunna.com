# Changelog

## 0.1.0 (unreleased)

First release, with the same word lists and matching rules as the JavaScript package 0.1.0.

- `ContainsProfanity`, `FindProfanity` and `Tokenize`.
- `Censor` to mask matches in place, with a custom `Mask` or a `Replace` function.
- `Check` to scan once, then inspect and censor the result: `Check(text).Censor()`.
- `FindProfanityMatches` to get each match with its byte offsets in the original text.
- `NewFilter` and `MustNewFilter` for other options, safe for concurrent use.
- `Languages` option to check English, Romanized Nepali and Devanagari separately.
- `Strictness` option with three levels: `Lenient`, `Standard` (default) and `Strict`.
- Handles leetspeak, `!` and `*` in place of letters, stretched letters and spelled-out letters.
- Handles Nepali postpositions and plurals in both scripts.
- Multi-word phrases in both scripts.
- The word lists, exported with every entry tagged by language and strictness.
- Go 1.22 or later; depends only on `golang.org/x/text`.
