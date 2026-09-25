# API reference

```py
from no_nepali_profanity import (
    check,
    contains_profanity,
    find_profanity,
    find_profanity_matches,
    censor,
    create_filter,
    tokenize,
    lexicon,
    ProfanityCheck,
    ProfanityFilter,
    ProfanityMatch,
)
```

## Options

`check`, `contains_profanity`, `find_profanity`, `find_profanity_matches`, `censor` and `create_filter` all take the
same optional `options` dict:

```py
{
    "languages": ["english", "romanized", "devanagari"],   # default: all three
    "strictness": "standard",                              # "lenient", "standard" or "strict"
}
```

### `languages`

Sets which word lists are checked. Leave a language out to turn it off.

| Value | Checks |
|---|---|
| `"english"` | English profanity (`fuck`, `bitch`, `idiot`…). |
| `"romanized"` | Nepali written in Latin letters, plus Hindi slang common in Nepal (`muji`, `chutiya`, `sasto manche`…). |
| `"devanagari"` | Nepali written in Devanagari (`मुजी`, `सस्तो मान्छे`…). |

```py
find_profanity("fuck muji मुजी", {"languages": ["romanized"]})               # ["muji"]
find_profanity("fuck muji मुजी", {"languages": ["english", "devanagari"]})   # ["fuck", "मुजी"]
```

An empty list turns every language off, so nothing is ever flagged.

### `strictness`

Sets how much is caught. Each level includes everything from the levels below it.

| Level | Adds |
|---|---|
| `"lenient"` | Severe profanity and slurs only. |
| `"standard"` (default) | Milder insults: `idiot`, `stupid`, `murkha`, `sala`, `kutta`, `sasto manche`… |
| `"strict"` | Stems that also start ordinary words or names: `rand`, `cond`, `kand`, `lund`. Catches more inflected forms, but flags words like `Randip`, `conditions` and `Kandel`. |

```py
contains_profanity("you idiot", {"strictness": "lenient"})        # False
contains_profanity("you idiot")                                   # True
find_profanity("terms and conditions")                            # []
find_profanity("terms and conditions", {"strictness": "strict"})  # ["conditions"]
```

Use `"strict"` only when a human reviews what gets flagged, for example as a moderation queue rather than as an
automatic block.

An unknown language or strictness raises a `TypeError`.

## `check(text, options=None)`

```py
def check(text: str, options: dict | None = None) -> ProfanityCheck

class ProfanityCheck:
    text: str                        # the text that was checked
    has_profanity: bool              # same as contains_profanity
    words: list[str]                 # same as find_profanity
    matches: list[ProfanityMatch]    # same as find_profanity_matches
    def censor(self, options: dict | None = None) -> str: ...
```

Scans the text once and returns everything the other functions would. `censor()` on the result reuses that scan,
so you can check and censor without scanning twice:

```py
result = check("you muji, F.U.C.K")

result.has_profanity         # True
result.words                 # ["muji", "fuck"]
result.matches[0]            # ProfanityMatch(text="muji", normalized="muji", start=4, end=8)
result.censor()              # "you ****, *******"

check("you muji").censor()   # "you ****"
```

## `contains_profanity(text, options=None)`

```py
def contains_profanity(text: str, options: dict | None = None) -> bool
```

Returns `True` if `text` contains at least one active word, stem or phrase. It returns `False` for an empty string.

This is `len(find_profanity(text, options)) > 0`. It doesn't stop at the first match, so it takes about as long as
`find_profanity`.

```py
contains_profanity("Great teacher!")   # False
contains_profanity("IDIOT")            # True
```

## `find_profanity(text, options=None)`

```py
def find_profanity(text: str, options: dict | None = None) -> list[str]
```

Returns the tokens and phrases that matched, without duplicates. It returns `[]` when the text is clean.

Each result is the token **after normalization**, not the dictionary word it matched, and not the original text:

- Letters are lowercased, and full-width letters are converted to plain ones.
- Leetspeak is decoded, so `sh1t` becomes `shit`.
- A `!` between letters becomes `i`, so `sh!t` becomes `shit`.
- Spelled-out letters are joined, so `f.u.c.k` becomes `fuck`.
- `*` wildcards stay as they are, so `f*ck` stays `f*ck`.
- Stretched letters stay as they are, so `fuuuuck` stays `fuuuuck`.
- Postpositions stay attached, so `mujiko` stays `mujiko`.
- A phrase match is returned as the whole phrase, for example `pesa garne`.

```py
find_profanity("f.u.c.k this sh1t")    # ["fuck", "shit"]
find_profanity("fuuuuck")              # ["fuuuuck"]
find_profanity("gedaharu")             # ["gedaharu"]
find_profanity("मु‍जी")                 # ["मुजी"] (zero-width joiner removed)
find_profanity("p3sa g@rne taba")      # ["pesa garne"]
find_profanity("chaak ko pwal")        # ["chaak", "chaak ko pwal"]
```

The last example returns two results: `chaak` is listed as a single word, and it is also part of a listed phrase.

To find *where* each match is, use `find_profanity_matches`.

## `find_profanity_matches(text, options=None)`

```py
def find_profanity_matches(text: str, options: dict | None = None) -> list[ProfanityMatch]

@dataclass
class ProfanityMatch:
    text: str         # exactly what the user typed, e.g. "F.U.C.K"
    normalized: str   # the normalized form, e.g. "fuck"
    start: int        # start index in the input
    end: int          # end index in the input, exclusive
```

Returns every match with its position in the original text, sorted by position. Unlike `find_profanity`, repeated
words are listed once per occurrence.

`start` and `end` are indexes into the Python string, so `text[match.start:match.end] == match.text`.

```py
find_profanity_matches("F.U.C.K this sh1t, muji. MUJI")
# [
#   ProfanityMatch(text="F.U.C.K", normalized="fuck", start=0,  end=7),
#   ProfanityMatch(text="sh1t",    normalized="shit", start=13, end=17),
#   ProfanityMatch(text="muji",    normalized="muji", start=19, end=23),
#   ProfanityMatch(text="MUJI",    normalized="muji", start=25, end=29),
# ]
```

When a phrase contains a listed word, both are returned, with the longer match first:

```py
find_profanity_matches("chaak ko pwal")
# [
#   ProfanityMatch(text="chaak ko pwal", normalized="chaak ko pwal", start=0, end=13),
#   ProfanityMatch(text="chaak",         normalized="chaak",         start=0, end=5),
# ]
```

## `censor(text, options=None)`

```py
def censor(text: str, options: dict | None = None) -> str
```

Returns the text with every match replaced. Everything else is left as it was. Besides `languages` and
`strictness`, `options` takes:

- `mask`: replaces each visible character of a match, except whitespace. The default is `"*"`.
- `replace`: a function that receives each match and returns its replacement. It takes precedence over `mask`.

Overlapping matches are merged into one before they're replaced.

```py
censor("you muji")                                        # "you ****"
censor("F.U.C.K this Sh1t!")                              # "******* this ****!"
censor("you muji", {"mask": "#"})                         # "you ####"
censor("you muji", {"replace": lambda m: "[censored]"})   # "you [censored]"
censor("fuck muji", {"languages": ["romanized"]})         # "fuck ****"
```

An empty `mask` raises a `TypeError`. See [Censoring](./censoring.md) for more.

## `create_filter(options=None)`

```py
def create_filter(options: dict | None = None) -> ProfanityFilter

class ProfanityFilter:
    def check(self, text: str) -> ProfanityCheck: ...
    def contains_profanity(self, text: str) -> bool: ...
    def find_profanity(self, text: str) -> list[str]: ...
    def find_profanity_matches(self, text: str) -> list[ProfanityMatch]: ...
    def censor(self, text: str, options: dict | None = None) -> str: ...   # mask and replace
```

Builds a filter with fixed options. The lookup tables for those options are built once, when you call
`create_filter`. Use it when you check a lot of text with the same settings:

```py
from no_nepali_profanity import create_filter

profanity_filter = create_filter({"languages": ["romanized"], "strictness": "lenient"})

profanity_filter.contains_profanity("muji")     # True
profanity_filter.contains_profanity("murkha")   # False (a "standard" word)
profanity_filter.find_profanity("fuck muji")    # ["muji"] (English is off)
profanity_filter.censor("fuck muji")            # "fuck ****"
profanity_filter.check("muji").censor()         # "****"
```

The top-level functions also cache a filter for each combination of options. Passing options on every call is fine,
but `create_filter` makes the settings explicit and checks them once, up front.

## `tokenize(text)`

```py
def tokenize(text: str) -> list[str]
```

Returns the tokens that the matcher checks against the word lists. Use it to find out why a word was caught or missed.

```py
tokenize("Great teacher!")    # ["great", "teacher"]
tokenize("f*ck this!")        # ["f*ck", "this"]
tokenize("m u j i ko")        # ["muji", "ko"]
tokenize("सीता कार्की")         # ["सीता", "कार्की"]
```

A run of three or more single letters is joined into one token. That is how `f u c k` and `f.u.c.k` are caught.

## `lexicon`

A module containing the word lists. Everything in it is a tuple, so it can't be changed.

**Tagged entries.** Each entry is a `LexiconEntry` named tuple:

```py
class LexiconEntry(NamedTuple):
    text: str
    language: str     # "english", "romanized" or "devanagari"
    strictness: str   # the lowest strictness that turns this entry on
```

| Export | Matched how |
|---|---|
| `WORDS` | Whole token, after normalization. A trailing postposition is removed first. |
| `STEMS` | The token starts with the stem. For example, `fuck` catches `fucking`. |
| `PHRASES` | Words in sequence, separated by any whitespace. |

```py
from no_nepali_profanity import lexicon

[e for e in lexicon.WORDS if e.language == "romanized" and e.strictness == "standard"]
```

**Flat lists.** These tuples of strings hold every entry in one script, at every strictness:

- `LATIN_WORDS`, `LATIN_STEMS` and `LATIN_PHRASES` cover English and Romanized Nepali.
- `DEVANAGARI_WORDS`, `DEVANAGARI_STEMS` and `DEVANAGARI_PHRASES` cover Devanagari.

**Postpositions.** `LATIN_SUFFIXES` (`ko`, `lai`, `haru`…) and `DEVANAGARI_SUFFIXES` (`को`, `लाई`, `हरू`…) are removed
before the whole-word check. They apply at every language and strictness setting.

The matcher builds its lookup tables from these lists, so you can't add your own words at runtime. To change the
lists, see [The lexicon](./lexicon.md).
