# Installation

## Install the package

::: code-group

```sh [Flutter]
flutter pub add no_nepali_profanity
```

```sh [Dart]
dart pub add no_nepali_profanity
```

:::

## Requirements

- **Dart 3.0 or later**, which includes every Flutter 3.10+ release.
- Every platform: Android, iOS, web, macOS, Windows, Linux and the Dart VM.

The package depends only on `unorm_dart`, a pure-Dart Unicode normalization library.

## Import it

```dart
import 'package:no_nepali_profanity/no_nepali_profanity.dart';
```

The word lists are in a separate library, so names like `words` don't clash with your own. Import it with a prefix:

```dart
import 'package:no_nepali_profanity/lexicon.dart' as lexicon;
```

## Checking on a server too

Checks in an app are easy to bypass, because anyone can call your API directly. Use them to warn users as they type,
and check again on your server before saving anything. The same package runs on a Dart server, and the other ports
give the same results if your server is in another language.
