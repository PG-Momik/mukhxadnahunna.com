# Contributing

<!--@include: ../_shared/contributing-intro.md-->

## Development setup

```sh
git clone https://github.com/PG-Momik/no-nepali-profanity-python.git
cd no-nepali-profanity-python
python -m venv .venv
.venv/bin/pip install -e ".[test]"

.venv/bin/pytest    # run the test suite
```

The code is in two files:

- `src/no_nepali_profanity/lexicon.py` holds the word lists, kept in step with the JavaScript package.
- `src/no_nepali_profanity/core.py` holds the matching logic.

A change to the matching logic has to give the same result as the JavaScript package, so port it there too, or open
an issue first.

<!--@include: ../_shared/contributing-words.md-->
