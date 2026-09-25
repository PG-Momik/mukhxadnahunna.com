# The lexicon

The lexicon is the set of word lists the filter checks against. It ships with the package, and you can read it
through the [exported word lists](./api.md#word-lists):

```go
for _, e := range nepaliprofanity.Words {
	if e.Language == nepaliprofanity.Romanized && e.Strictness == nepaliprofanity.Standard {
		fmt.Println(e.Text)
	}
}
```

## Entries

Every entry has three fields:

```go
type LexiconEntry struct {
	Text       string       // the word, stem or phrase
	Language   Language     // English, Romanized or Devanagari
	Strictness Strictness   // the lowest strictness that turns it on
}
```

Entries are grouped into three lists, and each list is matched differently:

| List | Matched how | Example |
|---|---|---|
| `Words` | The whole word, with or without a postposition. | `muji` catches `muji` and `mujiko`, not `mujibur`. |
| `Stems` | Any word that starts with the stem. | `fuck` catches `fucking` and `fucker`. |
| `Phrases` | The words in order, separated by any whitespace. | `sasto manche` catches `sasto   manche`, not `sasto ra manche`. |

Two more lists hold the postpositions that are removed before a whole-word check: `LatinSuffixes` (`ko`, `lai`,
`haru`…) and `DevanagariSuffixes` (`को`, `लाई`, `हरू`…).

<!--@include: ../_shared/lexicon-levels.md-->

## Flat lists

For convenience, the package also exports plain `[]string` lists of every entry in one script, at every strictness:
`LatinWords`, `LatinStems`, `LatinPhrases`, `DevanagariWords`, `DevanagariStems` and `DevanagariPhrases`.
