## Adding or changing a word

Every port uses the same word lists, and they're maintained in the
[JavaScript repository](https://github.com/PG-Momik/no-nepali-profanity), in `src/lexicon.ts`. Send word-list changes
there, and the other ports are updated to match. Each list is built from groups that share a language and a
strictness:

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
