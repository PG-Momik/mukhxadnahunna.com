# Usage

## Check a piece of text

`ContainsProfanity` returns `true` or `false`:

```go
nepaliprofanity.ContainsProfanity("Great teacher!")   // false
nepaliprofanity.ContainsProfanity("muji")             // true
nepaliprofanity.ContainsProfanity("मुजीको क्लास")      // true (Devanagari with a postposition)
nepaliprofanity.ContainsProfanity("sh!t lecturer")    // true (! used as i)
```

## Find out what matched

`FindProfanity` returns the words that matched. Use it to show a moderator why something was flagged, or to log it:

```go
nepaliprofanity.FindProfanity("f.u.c.k this sh1t")     // []string{"fuck", "shit"}
nepaliprofanity.FindProfanity("what the f*ck, sh*t")   // []string{"f*ck", "sh*t"}
nepaliprofanity.FindProfanity("Muji muji MUJI")        // []string{"muji"} (duplicates removed)
nepaliprofanity.FindProfanity("Shitij Adhikari")       // []string{}
```

The results are **normalized**: lowercased, with leetspeak decoded. They aren't the exact text the user typed. See
[`FindProfanity`](./api.md#findprofanity) for the details.

## Censor text

`Censor` masks every match and leaves the rest of the text alone:

```go
nepaliprofanity.Censor("you muji")                                              // "you ****"
nepaliprofanity.Censor("F.U.C.K this Sh1t!")                                    // "******* this ****!"
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{Mask: "#"})   // "you ####"
```

## Check and censor in one pass

`Check` scans the text once and returns a result you can inspect and then censor. It's the way to chain the two:

```go
result := nepaliprofanity.Check("you muji")

if result.HasProfanity {
	log.Println(result.Words) // [muji]
}
result.Censor()                              // "you ****"
nepaliprofanity.Check("you muji").Censor()   // "you ****"
```

See [Censoring](./censoring.md) for masks, custom replacements and what exactly gets masked.

## Choose which languages to check

The package-level functions check all three languages at the standard level. For other options, build a `Filter`
with `NewFilter`, and set `Languages` to check only some of them:

```go
romanized, err := nepaliprofanity.NewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.Romanized},
})
if err != nil {
	log.Fatal(err)
}
romanized.ContainsProfanity("fuck")   // false
romanized.ContainsProfanity("muji")   // true

// Nepali in both scripts, but not English
nepali := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.Romanized, nepaliprofanity.Devanagari},
})
nepali.FindProfanity("fuck muji मुजी")   // []string{"muji", "मुजी"}
```

| Language | Covers |
|---|---|
| `English` | English profanity and insults. |
| `Romanized` | Nepali written in Latin letters, plus Hindi slang common in Nepal. |
| `Devanagari` | Nepali written in Devanagari. |

## Choose how strict to be

`Strictness` sets how much is caught. The default is `Standard`.

| Strictness | Catches | Use it for |
|---|---|---|
| `Lenient` | Severe profanity and slurs only. | Casual communities where mild insults are fine. |
| `Standard` | The above, plus milder insults like `idiot`, `murkha` and `sala`. | Most sites. |
| `Strict` | The above, plus word stems that also match ordinary words and names. | Moderation queues reviewed by a person. |

```go
lenient := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Lenient})
strict := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Strict})

lenient.ContainsProfanity("you idiot")                  // false
nepaliprofanity.ContainsProfanity("you idiot")          // true

nepaliprofanity.FindProfanity("damn it")   // []string{}
strict.FindProfanity("damn it")            // []string{"damn"}
```

::: warning
`Strict` still flags a few ordinary words, like `damn` and `prick`. Names and
words its stems would hit, like `Randip` and `conditions`, are on a built-in allow list.
:::

## Reuse a filter

Build a filter once, when your app starts, and reuse it. `NewFilter` returns an error for an unknown language or
strictness, and `MustNewFilter` panics instead, which suits a package-level variable:

```go
var nepaliFilter = nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages:  []nepaliprofanity.Language{nepaliprofanity.Romanized, nepaliprofanity.Devanagari},
	Strictness: nepaliprofanity.Lenient,
})
```

```go
nepaliFilter.ContainsProfanity("muji")    // true
nepaliFilter.FindProfanity("fuck muji")   // []string{"muji"}
```

## Debug a match

If a word is flagged or missed unexpectedly, `Tokenize` shows the words the filter actually checked:

```go
nepaliprofanity.Tokenize("Great teacher!")   // []string{"great", "teacher"}
nepaliprofanity.Tokenize("f*ck this!")       // []string{"f*ck", "this"}
nepaliprofanity.Tokenize("m u j i ko")       // []string{"muji", "ko"}
```

[How matching works](./how-it-works.md) explains each step.
