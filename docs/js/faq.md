# FAQ

## Can it replace bad words with `****`?

Yes. Use `censor`, or `check(text).censor()` if you also want to know what matched:

```js
censor("you muji");            // "you ****"
check("you muji").censor();    // "you ****"
```

See [Censoring](./censoring.md).

## Can I highlight matches instead of hiding them?

Yes. Pass a `replace` function to `censor`, or use the positions from `findProfanityMatches`:

```js
censor("you muji", { replace: (m) => `<mark>${m.text}</mark>` });   // "you <mark>muji</mark>"
```

Escape the rest of the text first if it goes into HTML.

## Can I add my own words?

Yes. Pass `extraWords` to flag more words, and `allowWords` to never flag a word, such as a name on your site:

```js
import { createFilter } from "no-nepali-profanity";

const filter = createFilter({ extraWords: ["someword"], allowWords: ["somename"] });

filter.containsProfanity("s0mew0rd");   // true
```

Extra words are matched like the built-in ones, so leetspeak, stretched letters and postpositions are still caught.
To add words for everyone, see [Contributing](./contributing.md).

## Why was this word flagged?

Run the text through `findProfanity` to see which word matched, and `tokenize` to see the words the filter checked:

```js
import { findProfanity, tokenize } from "no-nepali-profanity";

findProfanity("damn it", { strictness: "strict" });   // ["damn"]
tokenize("damn it");                                  // ["damn", "it"]
```

If an ordinary word or a name is flagged at `"standard"` or `"lenient"`, please
[report it](./contributing.md#reporting-a-problem).

## Why wasn't this word caught?

It's probably not in the word lists, or it's in a stricter level than the one you use. Check the lexicon:

```js
import { lexicon } from "no-nepali-profanity";

lexicon.WORDS.find((e) => e.text === "idiot");
// { text: "idiot", language: "english", strictness: "standard" }
```

If it isn't there, [suggest it](./contributing.md).

## Which strictness should I use?

Use the default, `"standard"`, for most sites. Use `"lenient"` if mild insults are fine in your community. Use
`"strict"` only when a person reviews what gets flagged, because it catches a few ordinary words, like *damn*. See
[Block severe words, review the rest](./examples.md#block-severe-words-review-the-rest).

## Does it work in the browser?

Yes. It uses no Node.js APIs, so any bundler can include it. Browser checks are easy to bypass, so always check again
on the server.

## Is it fast?

Yes, for typical user text like comments, reviews and names. A filter builds its lookup tables once, and each check
is a single pass over the words in the text. To both check and censor, use `check(text)`, which reuses one scan for
both.

## Is it available in other languages?

Yes: [Python](/python/), [Go](/go/), [PHP](/php/) and [Flutter & Dart](/flutter/). Every port uses the same word
lists and matching rules, and is tested against this package's output, so a comment gets the same result on every
part of your stack.

## Does it support CommonJS?

The package is ESM-only. In a CommonJS file, load it with `await import("no-nepali-profanity")`. See
[Installation](./installation.md#import-it).
