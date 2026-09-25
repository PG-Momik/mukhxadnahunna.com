# Introduction

`no-nepali-profanity` is a small, dependency-free profanity filter for JavaScript and TypeScript. It detects and
censors profanity in **English**, **Romanized Nepali** and **Devanagari Nepali**, plus the Hindi slang common in
Nepal.

```js
import { censor, check, containsProfanity, findProfanity } from "no-nepali-profanity";

containsProfanity("Great teacher!");    // false
containsProfanity("मुजीको क्लास");       // true
findProfanity("f.u.c.k this sh1t");     // ["fuck", "shit"]
censor("you muji");                     // "you ****"
check("you muji").censor();             // "you ****"
```

<!--@include: ../_shared/why.md-->
- **Zero dependencies.** TypeScript source, ESM build and bundled type definitions.

## What it isn't

- **It doesn't understand meaning.** Insults without a listed word, sarcasm and context are out of scope. Treat it
  as a first-pass filter, and send anything that matters to a human moderator.

## Next steps

- [Install the package](./installation.md)
- [Learn the basics](./usage.md)
- [Censor text](./censoring.md)
- [See examples for real apps](./examples.md)
