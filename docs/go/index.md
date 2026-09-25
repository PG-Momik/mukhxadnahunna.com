# Introduction

`no-nepali-profanity-go` is a small profanity filter for Go. It detects and censors profanity in **English**,
**Romanized Nepali** and **Devanagari Nepali**, plus the Hindi slang common in Nepal.

```go
import nepaliprofanity "github.com/PG-Momik/no-nepali-profanity-go"

nepaliprofanity.ContainsProfanity("Great teacher!")   // false
nepaliprofanity.ContainsProfanity("मुजीको क्लास")      // true
nepaliprofanity.FindProfanity("f.u.c.k this sh1t")    // []string{"fuck", "shit"}
nepaliprofanity.Censor("you muji")                    // "you ****"
nepaliprofanity.Check("you muji").Censor()            // "you ****"
```

<!--@include: ../_shared/why.md-->
- **One small dependency.** Only `golang.org/x/text`, for Unicode normalization. Filters are safe for concurrent use.

## What it isn't

- **It doesn't understand meaning.** Insults without a listed word, sarcasm and context are out of scope. Treat it
  as a first-pass filter, and send anything that matters to a human moderator.

## Next steps

- [Install the package](./installation.md)
- [Learn the basics](./usage.md)
- [Censor text](./censoring.md)
- [See examples for real apps](./examples.md)
