# Usage

## Check a piece of text

`contains_profanity` returns `True` or `False`:

```py
from no_nepali_profanity import contains_profanity

contains_profanity("Great teacher!")   # False
contains_profanity("muji")             # True
contains_profanity("मुजीको क्लास")      # True (Devanagari with a postposition)
contains_profanity("sh!t lecturer")    # True (! used as i)
```

## Find out what matched

`find_profanity` returns the words that matched. Use it to show a moderator why something was flagged, or to log it:

```py
from no_nepali_profanity import find_profanity

find_profanity("f.u.c.k this sh1t")      # ["fuck", "shit"]
find_profanity("what the f*ck, sh*t")    # ["f*ck", "sh*t"]
find_profanity("Muji muji MUJI")         # ["muji"] (duplicates removed)
find_profanity("Shitij Adhikari")        # []
```

The results are **normalized**: lowercased, with leetspeak decoded. They aren't the exact text the user typed. See
[`find_profanity`](./api.md#find-profanity-text-options) for the details.

## Censor text

`censor` masks every match and leaves the rest of the text alone:

```py
from no_nepali_profanity import censor

censor("you muji")                  # "you ****"
censor("F.U.C.K this Sh1t!")        # "******* this ****!"
censor("you muji", {"mask": "#"})   # "you ####"
```

## Check and censor in one pass

`check` scans the text once and returns a result you can inspect and then censor. It's the way to chain the two:

```py
from no_nepali_profanity import check

result = check("you muji")

if result.has_profanity:
    print(result.words)        # ["muji"]
result.censor()                # "you ****"

check("you muji").censor()     # "you ****"
```

See [Censoring](./censoring.md) for masks, custom replacements and what exactly gets masked.

## Choose which languages to check

By default, all three languages are checked. Pass `languages` to check only some of them:

```py
# Only Romanized Nepali
contains_profanity("fuck", {"languages": ["romanized"]})   # False
contains_profanity("muji", {"languages": ["romanized"]})   # True

# Nepali in both scripts, but not English
find_profanity("fuck muji मुजी", {"languages": ["romanized", "devanagari"]})   # ["muji", "मुजी"]
```

| Language | Covers |
|---|---|
| `"english"` | English profanity and insults. |
| `"romanized"` | Nepali written in Latin letters, plus Hindi slang common in Nepal. |
| `"devanagari"` | Nepali written in Devanagari. |

## Choose how strict to be

`strictness` sets how much is caught. The default is `"standard"`.

| Strictness | Catches | Use it for |
|---|---|---|
| `"lenient"` | Severe profanity and slurs only. | Casual communities where mild insults are fine. |
| `"standard"` | The above, plus milder insults like `idiot`, `murkha` and `sala`. | Most sites. |
| `"strict"` | The above, plus word stems that also match ordinary words and names. | Moderation queues reviewed by a person. |

```py
contains_profanity("you idiot", {"strictness": "lenient"})         # False
contains_profanity("you idiot")                                    # True

find_profanity("terms and conditions")                             # []
find_profanity("terms and conditions", {"strictness": "strict"})   # ["conditions"]
```

::: warning
`"strict"` flags some ordinary words and names, like `conditions`, `Randip` and `Kandel`. Don't use it to
automatically reject text.
:::

## Reuse a filter

If you check a lot of text with the same options, create a filter once and reuse it:

```py
from no_nepali_profanity import create_filter

profanity_filter = create_filter({"languages": ["romanized", "devanagari"], "strictness": "lenient"})

profanity_filter.contains_profanity("muji")    # True
profanity_filter.find_profanity("fuck muji")   # ["muji"]
```

`create_filter` checks the options once and raises a `TypeError` if they're invalid, which surfaces mistakes when your
app starts rather than on the first request. The top-level functions also cache a filter for each set of options, so
passing options on every call is still fast.

## Debug a match

If a word is flagged or missed unexpectedly, `tokenize` shows the words the filter actually checked:

```py
from no_nepali_profanity import tokenize

tokenize("Great teacher!")   # ["great", "teacher"]
tokenize("f*ck this!")       # ["f*ck", "this"]
tokenize("m u j i ko")       # ["muji", "ko"]
```

[How matching works](./how-it-works.md) explains each step.
