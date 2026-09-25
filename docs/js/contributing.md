# Contributing

<!--@include: ../_shared/contributing-intro.md-->

## Development setup

```sh
git clone https://github.com/PG-Momik/no-nepali-profanity.git
cd no-nepali-profanity
npm install

npm test            # run the test suite (Vitest)
npm run typecheck   # check types
npm run build       # compile to dist/
```

The code is in two files:

- `src/lexicon.ts` holds the word lists.
- `src/index.ts` holds the matching logic.

<!--@include: ../_shared/contributing-words.md-->

## Reviewing the lists as a spreadsheet

`scripts/export-csv.mjs` exports the lists to `words.csv`, with the Devanagari pair next to each Romanized word.
People who don't write code can review that file in a spreadsheet app. The script reads the build output, so build
first:

```sh
npm run build
node scripts/export-csv.mjs
```

::: warning
The script overwrites `words.csv` and writes only the `kind`, `word` and `devanagari` columns. Any other columns
added by hand, like `category` or `severity`, are lost. Commit or copy the file first.
:::

`src/lexicon.ts` is the source of truth. The CSV is a review copy and isn't read back in.
