# Censoring

`censor` returns the text with every match masked. Everything else, including spacing, punctuation and emoji, is
left as it was.

```py
from no_nepali_profanity import censor

censor("you muji")                  # "you ****"
censor("F.U.C.K this Sh1t!")        # "******* this ****!"
censor("मुजीको क्लास")               # "*** क्लास"
censor("Great teacher!")            # "Great teacher!"
```

## Check and censor in one pass

To find out whether text has profanity *and* get a censored copy, use `check`. It scans the text once and returns
a result you can read and then censor, so you don't pay for a second scan:

```py
from no_nepali_profanity import check

result = check("you muji, F.U.C.K")

result.has_profanity   # True
result.words           # ["muji", "fuck"]
result.censor()        # "you ****, *******"
```

Because `censor()` is a method on the result, you can chain it:

```py
check("you muji").censor()                  # "you ****"
check("you muji").censor({"mask": "#"})     # "you ####"
```

A common pattern is to save the censored text and flag the original for a moderator:

```py
result = check(comment.body)

Comment.objects.create(
    body=result.censor(),
    flagged=result.has_profanity,
    flagged_words=result.words,
)
```

Calling `contains_profanity(text)` and then `censor(text)` gives the same result, but scans the text twice.

## Change the mask

`mask` sets the character used in place of each character of a match. The default is `*`.

```py
censor("you muji", {"mask": "#"})    # "you ####"
censor("you muji", {"mask": "•"})    # "you ••••"
```

## Custom replacements

`replace` receives each match and returns the text to put in its place. It takes precedence over `mask`.

```py
# A fixed label
censor("you muji", {"replace": lambda m: "[censored]"})
# "you [censored]"

# Keep the first letter
censor("you muji", {"replace": lambda m: m.text[0] + "*" * (len(m.text) - 1)})
# "you m***"

# Grawlix
censor("you muji", {"replace": lambda m: ("@#$%&!" * len(m.text))[: len(m.text)]})
# "you @#$%"

# Wrap it for your UI instead of hiding it
censor("you muji", {"replace": lambda m: f"<mark>{m.text}</mark>"})
# "you <mark>muji</mark>"
```

The match object is the same as the one returned by [`find_profanity_matches`](./api.md#find-profanity-matches-text-options):

| Field | Example | Meaning |
|---|---|---|
| `text` | `"F.U.C.K"` | Exactly what the user typed. |
| `normalized` | `"fuck"` | The normalized form that matched. |
| `start` | `0` | Start index in the input. |
| `end` | `7` | End index in the input, exclusive. |

::: warning Escape HTML
If the output goes into HTML, escape the text first. A `replace` function that returns markup, like the `<mark>`
example above, only receives the matched text, not the rest of the input.
:::

## With filter options

`censor` and `check` accept the same `languages` and `strictness` options as every other function:

```py
censor("fuck muji", {"languages": ["romanized"]})          # "fuck ****"
censor("you idiot", {"strictness": "lenient"})             # "you idiot"
check("you idiot", {"strictness": "lenient"}).censor()     # "you idiot"
```

A filter from `create_filter` has `check` and `censor` too:

```py
from no_nepali_profanity import create_filter

profanity_filter = create_filter({"languages": ["romanized", "devanagari"]})

profanity_filter.censor("fuck muji")           # "fuck ****"
profanity_filter.check("मुजी").censor()         # "**"
```

## What gets masked

- **Exactly the characters the user typed.** Positions are traced back through normalization, so leetspeak
  (`Sh1t`), `!` for `i` (`sh!!t`), full-width letters (`ＦＵＣＫ`) and zero-width characters are masked in full.
- **Spelled-out words, dots included.** `F.U.C.K` becomes `*******`.
- **One mask character per visible character.** Devanagari is counted by what you see, not by code point, so `मुजी`
  becomes `**`, not `****`.
- **Whitespace inside a phrase is kept.** `sasto manche` becomes `***** ******`.
- **Overlapping matches are merged.** `chaak ko pwal` is a phrase that contains the word `chaak`, and it's masked
  once, as `***** ** ****`.
- **Postpositions are masked with the word.** `mujiko` becomes `******`, because the filter reads it as one word.
