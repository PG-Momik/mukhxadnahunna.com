# Introduction

`no-nepali-profanity` is a small, dependency-free profanity filter for Python. It detects and censors profanity in
**English**, **Romanized Nepali** and **Devanagari Nepali**, plus the Hindi slang common in Nepal.

```py
from no_nepali_profanity import censor, check, contains_profanity, find_profanity

contains_profanity("Great teacher!")    # False
contains_profanity("मुजीको क्लास")       # True
find_profanity("f.u.c.k this sh1t")     # ["fuck", "shit"]
censor("you muji")                      # "you ****"
check("you muji").censor()              # "you ****"
```

<!--@include: ../_shared/why.md-->
- **Zero dependencies.** Pure Python, standard library only, with type hints (`py.typed`).

## What it isn't

- **It doesn't understand meaning.** Insults without a listed word, sarcasm and context are out of scope. Treat it
  as a first-pass filter, and send anything that matters to a human moderator.

## Next steps

- [Install the package](./installation.md)
- [Learn the basics](./usage.md)
- [Censor text](./censoring.md)
- [See examples for real apps](./examples.md)
