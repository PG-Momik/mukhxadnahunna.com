# Changelog

## 0.1.0 (unreleased)

First release, with the same word lists and matching rules as the JavaScript package 0.1.0.

- `Profanity::containsProfanity`, `findProfanity` and `tokenize`.
- `Profanity::censor` to mask matches in place, with a custom `mask` character or a `replace` callable.
- `Profanity::check` to scan once, then inspect and censor the result: `Profanity::check($text)->censor()`.
- `Profanity::findProfanityMatches` to get each match with its position in the original text.
- `Profanity::createFilter` for reusing one set of options.
- `languages` option to check English, Romanized Nepali and Devanagari separately.
- `strictness` option with three levels: `'lenient'`, `'standard'` (default) and `'strict'`.
- Handles leetspeak, `!` and `*` in place of letters, stretched letters and spelled-out letters.
- Handles Nepali postpositions and plurals in both scripts.
- Multi-word phrases in both scripts.
- A `Lexicon` class with every entry tagged by language and strictness.
- PHP 8.2 or later, with the `intl` and `mbstring` extensions.
