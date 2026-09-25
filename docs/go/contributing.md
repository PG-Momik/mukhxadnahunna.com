# Contributing

<!--@include: ../_shared/contributing-intro.md-->

## Development setup

```sh
git clone https://github.com/PG-Momik/no-nepali-profanity-go.git
cd no-nepali-profanity-go

go test -race ./...   # run the test suite
go run ./example      # run the example
```

The code is in three files:

- `lexicon.go` holds the word lists, kept in step with the JavaScript package.
- `filter.go` holds the matching logic.
- `types.go` holds the exported types.

A change to the matching logic has to give the same result as the JavaScript package, so port it there too, or open
an issue first.

<!--@include: ../_shared/contributing-words.md-->
