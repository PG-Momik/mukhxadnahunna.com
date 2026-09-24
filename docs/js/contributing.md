# Contributing

Contributions are welcome. The most useful one is a **review of the Nepali word lists by a native speaker**:
spotting entries that are ordinary words or names, adding common spellings, and saying whether an entry is at the
right strictness.

## Reporting a problem

Open an issue on [GitHub](https://github.com/PG-Momik/no-nepali-profanity/issues) with:

- the **exact input text**,
- what `findProfanity` returned, and what you expected,
- the options you passed, if any.

For a false positive, say whether the word is a name, a place or an ordinary word. That decides whether it's removed
or moved to `"strict"`.

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

## Adding or changing a word

Word lists are in `src/lexicon.ts`. Each list is built from groups that share a language and a strictness:

```ts
export const WORDS: readonly LexiconEntry[] = [
  ...tag("english", "lenient", ["fuck", "bitch", /* … */]),
  ...tag("english", "standard", ["idiot", "stupid", /* … */]),
  ...tag("romanized", "lenient", ["muji", "machikne", /* … */]),
  // …
];
```

Add the word to the group with the right language and strictness, and follow these rules:

1. **Search for real names first.** Check Nepali name lists and social media. If it's a name, a surname or the start
   of one, don't add it as a stem, and think twice before adding it as a word.
2. **Prefer a word over a stem.** A stem matches every word that starts with it. If a stem is worth having but hits
   ordinary words, put it in `"strict"`.
3. **Leave out everyday words, caste names and context-only insults.** See
   [what's deliberately left out](./lexicon.md#what-s-deliberately-left-out).
4. **Add both scripts.** If you add a Romanized word, add its Devanagari form too, and the other way round.
5. **Pick the strictness.** Severe words go in `"lenient"`, milder insults in `"standard"`, and anything that hits
   ordinary words in `"strict"`. If an entry causes a false positive, move it to `"strict"` rather than deleting it.
6. **Add tests.** Add the word to the "catches" list in `test/profanity.test.ts`. If it could collide with an
   ordinary word or name, add that word or name to the "does not flag" list too.

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

## Other ports

The Python, Go, PHP and Flutter ports will share the same word lists and matching rules. If you'd like to help build one, open an
issue.
