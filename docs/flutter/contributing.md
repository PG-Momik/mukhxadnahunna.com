# Contributing

<!--@include: ../_shared/contributing-intro.md-->

## Development setup

```sh
git clone https://github.com/PG-Momik/no-nepali-profanity-flutter.git
cd no-nepali-profanity-flutter
dart pub get

dart test       # run the test suite
dart analyze    # check for problems
```

The code is in `lib/src/`:

- `lexicon.dart` holds the word lists, kept in step with the JavaScript package.
- `filter.dart` holds the matching logic and the public functions.
- `types.dart` holds the shared types.

A change to the matching logic has to give the same result as the JavaScript package, so port it there too, or open
an issue first.

<!--@include: ../_shared/contributing-words.md-->
