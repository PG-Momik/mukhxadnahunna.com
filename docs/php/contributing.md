# Contributing

<!--@include: ../_shared/contributing-intro.md-->

## Development setup

```sh
git clone https://github.com/PG-Momik/no-nepali-profanity-php.git
cd no-nepali-profanity-php
composer install

composer test    # run the test suite (PHPUnit)
```

The code is in `src/`:

- `Lexicon.php` holds the word lists, kept in step with the JavaScript package.
- `ProfanityFilter.php` holds the matching logic.
- `Profanity.php` is the static facade.

A change to the matching logic has to give the same result as the JavaScript package, so port it there too, or open
an issue first.

<!--@include: ../_shared/contributing-words.md-->
