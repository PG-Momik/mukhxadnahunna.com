# Introduction

`no_nepali_profanity` is a small profanity filter for Dart and Flutter. It detects and censors profanity in
**English**, **Romanized Nepali** and **Devanagari Nepali**, plus the Hindi slang common in Nepal.

```dart
import 'package:no_nepali_profanity/no_nepali_profanity.dart';

containsProfanity('Great teacher!');    // false
containsProfanity('मुजीको क्लास');       // true
findProfanity('f.u.c.k this sh1t');     // ['fuck', 'shit']
censor('you muji');                     // 'you ****'
check('you muji').censor();             // 'you ****'
```

<!--@include: ../_shared/why.md-->
- **Pure Dart.** Runs in Flutter on every platform, and on the server. One small dependency, `unorm_dart`, for
  Unicode normalization.

## What it isn't

- **It doesn't understand meaning.** Insults without a listed word, sarcasm and context are out of scope. Treat it
  as a first-pass filter, and send anything that matters to a human moderator.

## Next steps

- [Install the package](./installation.md)
- [Learn the basics](./usage.md)
- [Censor text](./censoring.md)
- [See examples for real apps](./examples.md)
