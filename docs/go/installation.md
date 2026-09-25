# Installation

::: warning Pre-release
`no-nepali-profanity-go` has no tagged release yet. The command below will work once the first version is released.
:::

## Install the module

```sh
go get github.com/PG-Momik/no-nepali-profanity-go
```

## Requirements

- **Go 1.22 or later.**

The module depends only on `golang.org/x/text`, which it uses for Unicode normalization.

## Import it

The module path ends in `no-nepali-profanity-go`, and the package is called `nepaliprofanity`. Name it in the import
so the two read the same:

```go
import nepaliprofanity "github.com/PG-Momik/no-nepali-profanity-go"
```

## Concurrency

A `Filter` never changes after it's built, so one filter, or the package-level functions, can be used from any
number of goroutines at once.
