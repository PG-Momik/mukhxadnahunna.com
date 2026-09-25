# The lexicon

The lexicon is the set of word lists the filter checks against. It ships with the package, and you can read it
through the [`lexicon`](./api.md#lexicon) library:

```dart
import 'package:no_nepali_profanity/lexicon.dart' as lexicon;

lexicon.words.where((e) => e.language == Language.romanized && e.strictness == Strictness.standard);
```

## Entries

Every entry has three fields:

```dart
class LexiconEntry {
  final String text;             // the word, stem or phrase
  final Language language;       // english, romanized or devanagari
  final Strictness strictness;   // the lowest strictness that turns it on
}
```

Entries are grouped into three lists, and each list is matched differently:

| List | Matched how | Example |
|---|---|---|
| `words` | The whole word, with or without a postposition. | `muji` catches `muji` and `mujiko`, not `mujibur`. |
| `stems` | Any word that starts with the stem. | `fuck` catches `fucking` and `fucker`. |
| `phrases` | The words in order, separated by any whitespace. | `sasto manche` catches `sasto   manche`, not `sasto ra manche`. |

Two more lists hold the postpositions that are removed before a whole-word check: `latinSuffixes` (`ko`, `lai`,
`haru`…) and `devanagariSuffixes` (`को`, `लाई`, `हरू`…).

<!--@include: ../_shared/lexicon-levels.md-->

## Flat lists

For convenience, the library also has plain `List<String>` lists of every entry in one script, at every strictness:
`latinWords`, `latinStems`, `latinPhrases`, `devanagariWords`, `devanagariStems` and `devanagariPhrases`.
