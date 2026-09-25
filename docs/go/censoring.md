# Censoring

`Censor` returns the text with every match masked. Everything else, including spacing, punctuation and emoji, is
left as it was.

```go
nepaliprofanity.Censor("you muji")             // "you ****"
nepaliprofanity.Censor("F.U.C.K this Sh1t!")   // "******* this ****!"
nepaliprofanity.Censor("मुजीको क्लास")          // "*** क्लास"
nepaliprofanity.Censor("Great teacher!")       // "Great teacher!"
```

## Check and censor in one pass

To find out whether text has profanity *and* get a censored copy, use `Check`. It scans the text once and returns
a result you can read and then censor, so you don't pay for a second scan:

```go
result := nepaliprofanity.Check("you muji, F.U.C.K")

result.HasProfanity   // true
result.Words          // []string{"muji", "fuck"}
result.Censor()       // "you ****, *******"
```

`Censor` takes the same options as the package-level function:

```go
nepaliprofanity.Check("you muji").Censor()                                             // "you ****"
nepaliprofanity.Check("you muji").Censor(nepaliprofanity.CensorOptions{Mask: "#"})   // "you ####"
```

A common pattern is to save the censored text and flag the original for a moderator:

```go
result := nepaliprofanity.Check(comment.Body)

_, err := db.ExecContext(ctx,
	"INSERT INTO comments (body, flagged, flagged_words) VALUES ($1, $2, $3)",
	result.Censor(), result.HasProfanity, strings.Join(result.Words, ","),
)
```

Calling `ContainsProfanity(text)` and then `Censor(text)` gives the same result, but scans the text twice.

## Change the mask

`Mask` sets the string used in place of each character of a match. The default is `*`.

```go
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{Mask: "#"})   // "you ####"
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{Mask: "•"})   // "you ••••"
```

## Custom replacements

`Replace` receives each match and returns the text to put in its place. It takes precedence over `Mask`.

```go
// A fixed label
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{
	Replace: func(m nepaliprofanity.ProfanityMatch) string { return "[censored]" },
})
// "you [censored]"

// Keep the first letter
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{
	Replace: func(m nepaliprofanity.ProfanityMatch) string {
		return m.Text[:1] + strings.Repeat("*", len(m.Text)-1)
	},
})
// "you m***"

// Wrap it for your UI instead of hiding it
nepaliprofanity.Censor("you muji", nepaliprofanity.CensorOptions{
	Replace: func(m nepaliprofanity.ProfanityMatch) string { return "<mark>" + m.Text + "</mark>" },
})
// "you <mark>muji</mark>"
```

`m.Text[:1]` takes the first byte, which is fine for Latin text. For Devanagari, take the first rune instead.

The match is the same as the ones returned by [`FindProfanityMatches`](./api.md#findprofanitymatches):

| Field | Example | Meaning |
|---|---|---|
| `Text` | `"F.U.C.K"` | Exactly what the user typed. |
| `Normalized` | `"fuck"` | The normalized form that matched. |
| `Start` | `0` | Byte offset of the match in the input. |
| `End` | `7` | Byte offset just past the match. |

::: warning Escape HTML
If the output goes into HTML, escape the text first. A `Replace` function that returns markup, like the `<mark>`
example above, only receives the matched text, not the rest of the input.
:::

## With filter options

A `Filter` from `NewFilter` has `Check` and `Censor` too, with its languages and strictness:

```go
romanized := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.Romanized},
})
lenient := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Lenient})

romanized.Censor("fuck muji")              // "fuck ****"
lenient.Censor("you idiot")                // "you idiot"
lenient.Check("you idiot").Censor()        // "you idiot"
romanized.Check("muji muji").Censor()      // "**** ****"
```

## What gets masked

- **Exactly the characters the user typed.** Positions are traced back through normalization, so leetspeak
  (`Sh1t`), `!` for `i` (`sh!!t`), full-width letters (`ＦＵＣＫ`) and zero-width characters are masked in full.
- **Spelled-out words, dots included.** `F.U.C.K` becomes `*******`.
- **One mask per visible character.** Devanagari is counted by what you see, not by byte or rune, so `मुजी` becomes
  `**`, not `****`.
- **Whitespace inside a phrase is kept.** `sasto manche` becomes `***** ******`.
- **Overlapping matches are merged.** `chaak ko pwal` is a phrase that contains the word `chaak`, and it's masked
  once, as `***** ** ****`.
- **Postpositions are masked with the word.** `mujiko` becomes `******`, because the filter reads it as one word.
