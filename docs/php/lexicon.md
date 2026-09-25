# The lexicon

The lexicon is the set of word lists the filter checks against. It ships with the package, and you can read it
through the [`Lexicon`](./api.md#lexicon) class:

```php
use NoNepaliProfanity\Lexicon;

array_filter(Lexicon::WORDS, fn ($e) => $e['language'] === 'romanized' && $e['strictness'] === 'standard');
```

## Entries

Every entry is an array with three keys:

```php
[
    'text' => 'muji',            // the word, stem or phrase
    'language' => 'romanized',   // 'english', 'romanized' or 'devanagari'
    'strictness' => 'lenient',   // the lowest strictness that turns it on
]
```

Entries are grouped into three lists, and each list is matched differently:

| List | Matched how | Example |
|---|---|---|
| `Lexicon::WORDS` | The whole word, with or without a postposition. | `muji` catches `muji` and `mujiko`, not `mujibur`. |
| `Lexicon::STEMS` | Any word that starts with the stem. | `fuck` catches `fucking` and `fucker`. |
| `Lexicon::PHRASES` | The words in order, separated by any whitespace. | `sasto manche` catches `sasto   manche`, not `sasto ra manche`. |

Two more lists hold the postpositions that are removed before a whole-word check: `Lexicon::LATIN_SUFFIXES` (`ko`,
`lai`, `haru`…) and `Lexicon::DEVANAGARI_SUFFIXES` (`को`, `लाई`, `हरू`…).

<!--@include: ../_shared/lexicon-levels.md-->

## Flat lists

For convenience, `Lexicon` also has methods that return every entry in one script, at every strictness, as a list of
strings: `latinWords()`, `latinStems()`, `latinPhrases()`, `devanagariWords()`, `devanagariStems()` and
`devanagariPhrases()`.
