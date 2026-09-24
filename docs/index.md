---
layout: home

hero:
  name: mukhxadnahunna
  text: Profanity filtering for Nepali text
  tagline: English, Romanized Nepali and Devanagari in one pass. Careful with real names.
  actions:
    - theme: brand
      text: Get started with JavaScript
      link: /js/
    - theme: alt
      text: See the ports
      link: "#ports"

features:
  - title: Three scripts, one check
    details: Catches English (fuck), Romanized Nepali (muji) and Devanagari (मुजी), plus the Hindi slang common in Nepal.
  - title: Hard to dodge
    details: Reads leetspeak (sh1t), ! and * in place of letters (sh!t, f*ck), stretched letters (fuuuuck) and spelled-out words (f.u.c.k).
  - title: Understands Nepali grammar
    details: Words with postpositions and plurals attached, like mujiko, randiharu and मुजीहरू, are still caught.
  - title: Names are safe
    details: Shitij, Putali, Asha, Randip and Kandel aren't flagged. Wrongly blocking a real name does more harm than missing a swear.
  - title: Detect or censor
    details: Check whether text is clean, list what matched, or mask it in place, as in "you muji" → "you ****".
  - title: Adjustable
    details: Turn each language on or off, and choose lenient, standard or strict to set how much is caught.
  - title: No dependencies
    details: Small and self-contained. The same word lists and rules in every port.
---

## What's in a name

**मुख छाड्नु हुन्न** (*mukh chhadnu hunna*) means roughly "don't be foul-mouthed". This site hosts the
documentation for a family of packages that detect profanity in Nepali user text: comments, reviews, display names
and chat.

## Ports {#ports}

Each port has its own package and shares the same word lists and matching rules.

| Language | Package | Status | Docs |
|---|---|---|---|
| JavaScript / TypeScript | `no-nepali-profanity` (npm) | Pre-release | [Read the docs](/js/) |
| PHP / Laravel | — | Planned | — |
| Python | — | Planned | — |
| Go | — | Planned | — |

## Quick look

```js
import { censor, containsProfanity, findProfanity } from "no-nepali-profanity";

containsProfanity("Great teacher!");    // false
containsProfanity("मुजीको कक्षा");       // true
findProfanity("f.u.c.k this sh1t");     // ["fuck", "shit"]
censor("you muji");                     // "you ****"
```
