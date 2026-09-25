# Changelog

## 0.2.0 (unreleased)

- Many more English words, including slurs (`fag`, `faggot`, `nigger`…) and compounds (`shitface`, `dipshit`,
  `jackass`…), and more Romanized and Devanagari Nepali words (`jhant`, `lauda`, `chhinal`, `gadha`, `ullu`…).
- New English words at the strict level that are also ordinary words: `damn`, `cum`, `prick`, `hoe` and others.
- `shit` is now a stem, so `shitface` and `shitting` are caught. Names that start with it, like Shitij and
  Shital, are on the allow list.
- A built-in allow list of names and ordinary words, like Randip, Shitij, conditions and Scunthorpe, that are never
  flagged. The strict level no longer flags them.
- A few roots, like `fuck` and `bitch`, are caught inside a longer word: `dumbfuck`, `sonofabitch`.
- `x` is read as `chh` in Romanized Nepali, so `xakka` matches `chhakka`. `chhod` ("leave") and `chhodnu` are no longer
  flagged by the stem `chod`.
- Words split by punctuation without a space are read joined: `sh.it`, `fu-ck`.
- Accents and Cyrillic or Greek look-alike letters are removed or replaced: `fück`, `fuсk`. `8` reads as `b`, `9` as
  `g` and `€` as `e`.
- `extraWords` option to flag more words, and `allowWords` option to never flag a word.

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
