# FAQ

## Can it replace bad words with `****`?

Yes. Use `Censor`, or `Check(text).Censor()` if you also want to know what matched:

```go
nepaliprofanity.Censor("you muji")             // "you ****"
nepaliprofanity.Check("you muji").Censor()     // "you ****"
```

See [Censoring](./censoring.md).

## Can I highlight matches instead of hiding them?

Yes. Pass a `Replace` function to `Censor`, or use the positions from `FindProfanityMatches`. Escape the rest of the
text first if it goes into HTML. See
[Highlight matches for moderators](./examples.md#highlight-matches-for-moderators).

## Can I add my own words?

Yes. Set `ExtraWords` to flag more words, and `AllowWords` to never flag a word, such as a name on your site:

```go
filter := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	ExtraWords: []string{"someword"},
	AllowWords: []string{"somename"},
})

filter.ContainsProfanity("s0mew0rd")   // true
```

Extra words are matched like the built-in ones, so leetspeak, stretched letters and postpositions are still caught.
To add words for everyone, see [Contributing](./contributing.md).

## Why was this word flagged?

Run the text through `FindProfanity` to see which word matched, and `Tokenize` to see the words the filter checked:

```go
strict := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Strict})

strict.FindProfanity("damn it")               // []string{"damn"}
nepaliprofanity.Tokenize("damn it")           // []string{"damn", "it"}
```

If an ordinary word or a name is flagged at `Standard` or `Lenient`, please
[report it](./contributing.md#reporting-a-problem).

## Why wasn't this word caught?

It's probably not in the word lists, or it's in a stricter level than the one you use. Check the lexicon:

```go
for _, e := range nepaliprofanity.Words {
	if e.Text == "idiot" {
		fmt.Printf("%+v\n", e) // {Text:idiot Language:english Strictness:standard}
	}
}
```

If it isn't there, [suggest it](./contributing.md).

## Which strictness should I use?

Use the default, `Standard`, for most sites. Use `Lenient` if mild insults are fine in your community. Use `Strict`
only when a person reviews what gets flagged, because it catches a few ordinary words, like *damn*. See
[Block severe words, review the rest](./examples.md#block-severe-words-review-the-rest).

## Is it fast?

Yes, for typical user text like comments, reviews and names. A filter builds its lookup tables once, and each check
is a single pass over the words in the text. To both check and censor, use `Check(text)`, which reuses one scan for
both.

## Is it safe for concurrent use?

Yes. A `Filter` never changes after it's built, so one filter, or the package-level functions, can be used from any
number of goroutines at once.

## Does it give the same results as the JavaScript package?

Yes. Every port uses the same word lists and matching rules, and is tested against the JavaScript package's output.
The one difference is how match positions are counted: Go indexes strings by byte, so `Start` and `End` are byte
offsets, where JavaScript counts UTF-16 code units. Either way, slicing the input with them gives the matched text.
