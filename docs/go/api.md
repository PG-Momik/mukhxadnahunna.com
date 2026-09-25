# API reference

```go
import nepaliprofanity "github.com/PG-Momik/no-nepali-profanity-go"
```

| Package-level | On a `*Filter` |
|---|---|
| `Check(text string) *ProfanityCheck` | `f.Check(text)` |
| `ContainsProfanity(text string) bool` | `f.ContainsProfanity(text)` |
| `FindProfanity(text string) []string` | `f.FindProfanity(text)` |
| `FindProfanityMatches(text string) []ProfanityMatch` | `f.FindProfanityMatches(text)` |
| `Censor(text string, options ...CensorOptions) string` | `f.Censor(text, options...)` |
| `Tokenize(text string) []string` | |
| `NewFilter(options FilterOptions) (*Filter, error)` | |
| `MustNewFilter(options FilterOptions) *Filter` | |

## Options

The package-level functions check all three languages at the standard level. For anything else, build a `Filter`:

```go
type FilterOptions struct {
	Languages  []Language   // nil: all three. An empty, non-nil slice: none.
	Strictness Strictness   // "": Standard
}

type Language string     // English, Romanized, Devanagari
type Strictness string   // Lenient, Standard, Strict
```

### `Languages`

Sets which word lists are checked. Leave a language out to turn it off.

| Value | Checks |
|---|---|
| `English` | English profanity (`fuck`, `bitch`, `idiot`…). |
| `Romanized` | Nepali written in Latin letters, plus Hindi slang common in Nepal (`muji`, `chutiya`, `sasto manche`…). |
| `Devanagari` | Nepali written in Devanagari (`मुजी`, `सस्तो मान्छे`…). |

```go
romanized := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.Romanized},
})
englishAndDevanagari := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.English, nepaliprofanity.Devanagari},
})

romanized.FindProfanity("fuck muji मुजी")              // []string{"muji"}
englishAndDevanagari.FindProfanity("fuck muji मुजी")   // []string{"fuck", "मुजी"}
```

A `nil` slice checks all three languages. An empty, non-nil slice turns every language off, so nothing is ever
flagged.

### `Strictness`

Sets how much is caught. Each level includes everything from the levels below it.

| Level | Adds |
|---|---|
| `Lenient` | Severe profanity and slurs only. |
| `Standard` (default) | Milder insults: `idiot`, `stupid`, `murkha`, `sala`, `kutta`, `sasto manche`… |
| `Strict` | Stems that also start ordinary words or names: `rand`, `cond`, `kand`, `lund`. Catches more inflected forms, but flags words like `Randip`, `conditions` and `Kandel`. |

```go
lenient := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Lenient})
strict := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Strict})

lenient.ContainsProfanity("you idiot")                  // false
nepaliprofanity.ContainsProfanity("you idiot")          // true
nepaliprofanity.FindProfanity("terms and conditions")   // []string{}
strict.FindProfanity("terms and conditions")            // []string{"conditions"}
```

Use `Strict` only when a human reviews what gets flagged, for example as a moderation queue rather than as an
automatic block.

`NewFilter` returns an error for an unknown language or strictness, and `MustNewFilter` panics.

## `Check`

```go
func Check(text string) *ProfanityCheck

type ProfanityCheck struct {
	Text         string             // the text that was checked
	HasProfanity bool               // same as ContainsProfanity
	Words        []string           // same as FindProfanity
	Matches      []ProfanityMatch   // same as FindProfanityMatches
}

func (c *ProfanityCheck) Censor(options ...CensorOptions) string
```

Scans the text once and returns everything the other functions would. `Censor()` on the result reuses that scan,
so you can check and censor without scanning twice:

```go
result := nepaliprofanity.Check("you muji, F.U.C.K")

result.HasProfanity                          // true
result.Words                                 // []string{"muji", "fuck"}
result.Matches[0]                            // nepaliprofanity.ProfanityMatch{Text: "muji", Normalized: "muji", Start: 4, End: 8}
result.Censor()                              // "you ****, *******"
nepaliprofanity.Check("you muji").Censor()   // "you ****"
```

## `ContainsProfanity`

```go
func ContainsProfanity(text string) bool
```

Returns `true` if `text` contains at least one active word, stem or phrase. It returns `false` for an empty string.

This is `len(FindProfanity(text)) > 0`. It doesn't stop at the first match, so it takes about as long as
`FindProfanity`.

```go
nepaliprofanity.ContainsProfanity("Great teacher!")   // false
nepaliprofanity.ContainsProfanity("IDIOT")            // true
```

## `FindProfanity`

```go
func FindProfanity(text string) []string
```

Returns the tokens and phrases that matched, without duplicates. It returns an empty slice when the text is clean.

Each result is the token **after normalization**, not the dictionary word it matched, and not the original text:

- Letters are lowercased, and full-width letters are converted to plain ones.
- Leetspeak is decoded, so `sh1t` becomes `shit`.
- A `!` between letters becomes `i`, so `sh!t` becomes `shit`.
- Spelled-out letters are joined, so `f.u.c.k` becomes `fuck`.
- `*` wildcards stay as they are, so `f*ck` stays `f*ck`.
- Stretched letters stay as they are, so `fuuuuck` stays `fuuuuck`.
- Postpositions stay attached, so `mujiko` stays `mujiko`.
- A phrase match is returned as the whole phrase, for example `pesa garne`.

```go
nepaliprofanity.FindProfanity("f.u.c.k this sh1t")   // []string{"fuck", "shit"}
nepaliprofanity.FindProfanity("fuuuuck")             // []string{"fuuuuck"}
nepaliprofanity.FindProfanity("gedaharu")            // []string{"gedaharu"}
nepaliprofanity.FindProfanity("मु‍जी")                // []string{"मुजी"} (zero-width joiner removed)
nepaliprofanity.FindProfanity("p3sa g@rne taba")     // []string{"pesa garne"}
nepaliprofanity.FindProfanity("chaak ko pwal")       // []string{"chaak", "chaak ko pwal"}
```

The last example returns two results: `chaak` is listed as a single word, and it is also part of a listed phrase.

To find *where* each match is, use `FindProfanityMatches`.

## `FindProfanityMatches`

```go
func FindProfanityMatches(text string) []ProfanityMatch

type ProfanityMatch struct {
	Text       string   // exactly what the user typed, e.g. "F.U.C.K"
	Normalized string   // the normalized form, e.g. "fuck"
	Start      int      // byte offset of the match in the input
	End        int      // byte offset just past the match
}
```

Returns every match with its position in the original text, sorted by position. Unlike `FindProfanity`, repeated
words are listed once per occurrence.

`Start` and `End` are byte offsets, so `text[m.Start:m.End] == m.Text`.

```go
nepaliprofanity.FindProfanityMatches("F.U.C.K this sh1t, muji. MUJI")
// []ProfanityMatch{
// 	{Text: "F.U.C.K", Normalized: "fuck", Start: 0, End: 7},
// 	{Text: "sh1t", Normalized: "shit", Start: 13, End: 17},
// 	{Text: "muji", Normalized: "muji", Start: 19, End: 23},
// 	{Text: "MUJI", Normalized: "muji", Start: 25, End: 29},
// }
```

When a phrase contains a listed word, both are returned, with the longer match first:

```go
nepaliprofanity.FindProfanityMatches("chaak ko pwal")
// []ProfanityMatch{
// 	{Text: "chaak ko pwal", Normalized: "chaak ko pwal", Start: 0, End: 13},
// 	{Text: "chaak", Normalized: "chaak", Start: 0, End: 5},
// }
```

## `Censor`

```go
func Censor(text string, options ...CensorOptions) string

type CensorOptions struct {
	Mask    string                             // "": "*"
	Replace func(match ProfanityMatch) string   // takes precedence over Mask
}
```

Returns the text with every match replaced. Everything else is left as it was.

- `Mask` replaces each visible character of a match, except whitespace.
- `Replace` receives each match and returns its replacement.
- Overlapping matches are merged into one before they're replaced.

```go
nepaliprofanity.Censor("you muji")                                              // "you ****"
nepaliprofanity.Censor("F.U.C.K this Sh1t!")                                    // "******* this ****!"
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{Mask: "#"})   // "you ####"
```

See [Censoring](./censoring.md) for more.

## `NewFilter`

```go
func NewFilter(options FilterOptions) (*Filter, error)
func MustNewFilter(options FilterOptions) *Filter
```

Builds a filter with fixed options. The lookup tables for those options are built once, when you call `NewFilter`.
A `Filter` has the same methods as the package-level functions, and is safe for concurrent use:

```go
f, err := nepaliprofanity.NewFilter(nepaliprofanity.FilterOptions{
	Languages:  []nepaliprofanity.Language{nepaliprofanity.Romanized},
	Strictness: nepaliprofanity.Lenient,
})
if err != nil {
	log.Fatal(err)
}

f.ContainsProfanity("muji")       // true
f.ContainsProfanity("murkha")     // false (a Standard word)
f.FindProfanity("fuck muji")      // []string{"muji"} (English is off)
f.Censor("fuck muji")             // "fuck ****"
f.Check("muji").Censor()          // "****"
```

## `Tokenize`

```go
func Tokenize(text string) []string
```

Returns the tokens that the matcher checks against the word lists. Use it to find out why a word was caught or missed.

```go
nepaliprofanity.Tokenize("Great teacher!")   // []string{"great", "teacher"}
nepaliprofanity.Tokenize("f*ck this!")       // []string{"f*ck", "this"}
nepaliprofanity.Tokenize("m u j i ko")       // []string{"muji", "ko"}
nepaliprofanity.Tokenize("सीता कार्की")        // []string{"सीता", "कार्की"}
```

A run of three or more single letters is joined into one token. That is how `f u c k` and `f.u.c.k` are caught.

## Word lists

The package exports the word lists it matches against.

**Tagged entries.** Each entry is a `LexiconEntry`:

```go
type LexiconEntry struct {
	Text       string
	Language   Language
	Strictness Strictness   // the lowest strictness that turns this entry on
}
```

| Variable | Matched how |
|---|---|
| `Words` | Whole token, after normalization. A trailing postposition is removed first. |
| `Stems` | The token starts with the stem. For example, `fuck` catches `fucking`. |
| `Phrases` | Words in sequence, separated by any whitespace. |

**Flat lists.** These `[]string` lists hold every entry in one script, at every strictness:

- `LatinWords`, `LatinStems` and `LatinPhrases` cover English and Romanized Nepali.
- `DevanagariWords`, `DevanagariStems` and `DevanagariPhrases` cover Devanagari.

**Postpositions.** `LatinSuffixes` (`ko`, `lai`, `haru`…) and `DevanagariSuffixes` (`को`, `लाई`, `हरू`…) are removed
before the whole-word check. They apply at every language and strictness setting.

A filter builds its lookup tables from these lists when it's created, so changing them afterwards has no effect, and
changing them at all isn't supported. To change the lists, see [The lexicon](./lexicon.md).
