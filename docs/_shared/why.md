<!-- This file has no newline at the end: each port's index.md adds its own feature bullet right after it. -->
## Why another profanity filter?

General-purpose profanity filters are built for English. On a Nepali site they fail in two ways:

- **They miss Nepali.** People write Nepali in Devanagari (`मुजी`) and in Latin letters (`muji`, `mujiko`), often in
  the same sentence as English. An English word list catches neither.
- **They block real names.** Substring matching flags names like *Shitij* or *Randip*. On a site where people sign up
  with their real names, that is a worse failure than a missed swear.

This package is built for that situation: it matches whole words, understands Nepali postpositions, and checks its
word lists against common Nepali names.

## Features

- **Three scripts in one pass.** English, Romanized Nepali and Devanagari, including mixed text.
- **Handles common dodges.** Leetspeak (`sh1t`, `@ss`), `!` for `i` (`sh!t`), `*` for a hidden letter (`f*ck`),
  stretched letters (`fuuuuck`) and spelled-out letters (`f.u.c.k`, `f u c k`).
- **Understands Nepali grammar.** Postpositions and plurals like `-ko`, `-lai` and `-haru` (`mujiko`, `मुजीहरू`).
- **Handles Devanagari spelling variants.** Nukta, chandrabindu vs anusvara, and zero-width joiners.
- **Censors in place.** Masks exactly what the user typed, even `F.U.C.K` or `Sh1t`, and leaves the rest alone.
- **Catches phrases.** Word pairs that are only offensive together, like `sasto manche`.
- **Configurable.** Turn each language on or off, and pick one of three strictness levels.
- **The same in every language.** JavaScript, Python, Go, PHP and Dart share the word lists and matching rules, and
  are tested against the same inputs, so a comment gets the same result on every part of your stack.