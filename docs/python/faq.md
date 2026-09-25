# FAQ

## Can it replace bad words with `****`?

Yes. Use `censor`, or `check(text).censor()` if you also want to know what matched:

```py
censor("you muji")             # "you ****"
check("you muji").censor()     # "you ****"
```

See [Censoring](./censoring.md).

## Can I highlight matches instead of hiding them?

Yes. Pass a `replace` function to `censor`, or use the positions from `find_profanity_matches`:

```py
censor("you muji", {"replace": lambda m: f"<mark>{m.text}</mark>"})   # "you <mark>muji</mark>"
```

Escape the rest of the text first if it goes into HTML. See
[Highlight matches for moderators](./examples.md#highlight-matches-for-moderators).

## Can I add my own words?

Not at runtime. The word lists are built into the package. To add words for everyone, see
[Contributing](./contributing.md). To add words only for your app, run your own check alongside the filter:

```py
from no_nepali_profanity import contains_profanity

extra = {"someword", "anotherword"}

def is_blocked(text: str) -> bool:
    return contains_profanity(text) or any(w in extra for w in text.lower().split())
```

## Why was this word flagged?

Run the text through `find_profanity` to see which word matched, and `tokenize` to see the words the filter checked:

```py
from no_nepali_profanity import find_profanity, tokenize

find_profanity("terms and conditions", {"strictness": "strict"})   # ["conditions"]
tokenize("terms and conditions")                                   # ["terms", "and", "conditions"]
```

If an ordinary word or a name is flagged at `"standard"` or `"lenient"`, please
[report it](./contributing.md#reporting-a-problem).

## Why wasn't this word caught?

It's probably not in the word lists, or it's in a stricter level than the one you use. Check the lexicon:

```py
from no_nepali_profanity import lexicon

next(e for e in lexicon.WORDS if e.text == "idiot")
# LexiconEntry(text="idiot", language="english", strictness="standard")
```

If it isn't there, [suggest it](./contributing.md).

## Which strictness should I use?

Use the default, `"standard"`, for most sites. Use `"lenient"` if mild insults are fine in your community. Use
`"strict"` only when a person reviews what gets flagged, because it catches some ordinary words and names. See
[Block severe words, review the rest](./examples.md#block-severe-words-review-the-rest).

## Is it fast?

Yes, for typical user text like comments, reviews and names. A filter builds its lookup tables once, and each check
is a single pass over the words in the text. To both check and censor, use `check(text)`, which reuses one scan for
both.

## Is it thread-safe?

Yes. A filter never changes after it's built, so one filter, or the top-level functions, can be used from many
threads at once.

## Does it give the same results as the JavaScript package?

Yes. Every port uses the same word lists and matching rules, and is tested against the JavaScript package's output.
The one difference is how match positions are counted: Python indexes strings by code point, so `start` and `end`
count code points, where JavaScript counts UTF-16 code units. Either way, slicing the input with them gives the
matched text.
