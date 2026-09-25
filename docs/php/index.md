# Introduction

`pg-momik/no-nepali-profanity` is a small, dependency-free profanity filter for PHP. It detects and censors profanity
in **English**, **Romanized Nepali** and **Devanagari Nepali**, plus the Hindi slang common in Nepal.

```php
use NoNepaliProfanity\Profanity;

Profanity::containsProfanity('Great teacher!');    // false
Profanity::containsProfanity('मुजीको क्लास');       // true
Profanity::findProfanity('f.u.c.k this sh1t');     // ['fuck', 'shit']
Profanity::censor('you muji');                     // 'you ****'
Profanity::check('you muji')->censor();            // 'you ****'
```

<!--@include: ../_shared/why.md-->
- **No Composer dependencies.** Plain PHP 8.2+, using the `intl` and `mbstring` extensions. Works in any framework.

## What it isn't

- **It doesn't understand meaning.** Insults without a listed word, sarcasm and context are out of scope. Treat it
  as a first-pass filter, and send anything that matters to a human moderator.

## Next steps

- [Install the package](./installation.md)
- [Learn the basics](./usage.md)
- [Censor text](./censoring.md)
- [See examples for real apps](./examples.md)
