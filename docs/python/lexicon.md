# The lexicon

The lexicon is the set of word lists the filter checks against. It ships with the package, and you can read it
through the [`lexicon`](./api.md#lexicon) module:

```py
from no_nepali_profanity import lexicon

[e for e in lexicon.WORDS if e.language == "romanized" and e.strictness == "standard"]
```

## Entries

Every entry has three fields:

```py
class LexiconEntry(NamedTuple):
    text: str         # the word, stem or phrase
    language: str     # "english", "romanized" or "devanagari"
    strictness: str   # the lowest strictness that turns it on
```

Entries are grouped into three lists, and each list is matched differently:

| List | Matched how | Example |
|---|---|---|
| `WORDS` | The whole word, with or without a postposition. | `muji` catches `muji` and `mujiko`, not `mujibur`. |
| `STEMS` | Any word that starts with the stem. | `fuck` catches `fucking` and `fucker`. |
| `PHRASES` | The words in order, separated by any whitespace. | `sasto manche` catches `sasto   manche`, not `sasto ra manche`. |

Two more lists hold the postpositions that are removed before a whole-word check: `LATIN_SUFFIXES` (`ko`, `lai`,
`haru`…) and `DEVANAGARI_SUFFIXES` (`को`, `लाई`, `हरू`…).

<!--@include: ../_shared/lexicon-levels.md-->

## Flat lists

For convenience, the lexicon also has plain tuples of every entry in one script, at every strictness:
`LATIN_WORDS`, `LATIN_STEMS`, `LATIN_PHRASES`, `DEVANAGARI_WORDS`, `DEVANAGARI_STEMS` and `DEVANAGARI_PHRASES`.
