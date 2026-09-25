# API reference

```php
use NoNepaliProfanity\Lexicon;
use NoNepaliProfanity\Profanity;
use NoNepaliProfanity\ProfanityCheck;
use NoNepaliProfanity\ProfanityFilter;
use NoNepaliProfanity\ProfanityMatch;
```

## Options

`check`, `containsProfanity`, `findProfanity`, `findProfanityMatches`, `censor` and `createFilter` all take the same
optional `$options` array:

```php
[
    'languages' => ['english', 'romanized', 'devanagari'],   // default: all three
    'strictness' => 'standard',                              // 'lenient', 'standard' or 'strict'
    'extraWords' => [],                                      // more words to flag
    'allowWords' => [],                                      // words never to flag
]
```

### `languages`

Sets which word lists are checked. Leave a language out to turn it off.

| Value | Checks |
|---|---|
| `'english'` | English profanity (`fuck`, `bitch`, `idiot`…). |
| `'romanized'` | Nepali written in Latin letters, plus Hindi slang common in Nepal (`muji`, `chutiya`, `sasto manche`…). |
| `'devanagari'` | Nepali written in Devanagari (`मुजी`, `सस्तो मान्छे`…). |

```php
Profanity::findProfanity('fuck muji मुजी', ['languages' => ['romanized']]);               // ['muji']
Profanity::findProfanity('fuck muji मुजी', ['languages' => ['english', 'devanagari']]);   // ['fuck', 'मुजी']
```

An empty array turns every language off, so nothing is ever flagged.

### `strictness`

Sets how much is caught. Each level includes everything from the levels below it.

| Level | Adds |
|---|---|
| `'lenient'` | Severe profanity and slurs only. |
| `'standard'` (default) | Milder insults: `idiot`, `stupid`, `murkha`, `sala`, `kutta`, `sasto manche`… |
| `'strict'` | Words and stems that are also ordinary words: `damn`, `cum`, `prick`, and the stems `rand`, `cond`, `kand` and `lund`. The names and words those stems would hit most, like `Randip`, `conditions` and `Kandel`, are on a built-in allow list and stay clean. |

```php
Profanity::containsProfanity('you idiot', ['strictness' => 'lenient']);        // false
Profanity::containsProfanity('you idiot');                                     // true
Profanity::findProfanity('damn it');                                           // []
Profanity::findProfanity('damn it', ['strictness' => 'strict']);               // ['damn']
Profanity::findProfanity('Randip read the conditions', ['strictness' => 'strict']);  // []
```

`'strict'` still catches a few ordinary words, like *damn* and *prick*. Use it where that's the policy you want, or
in a moderation queue that a person reviews.

### `extraWords` and `allowWords`

Adds words to flag and words never to flag. Extra words count at every strictness and are matched like the built-in
ones, so leetspeak, stretched letters and postpositions are still caught. Allowed words are never flagged, with or
without a postposition, which is how to keep a name on your site from matching a stem.

```php
$filter = Profanity::createFilter(['extraWords' => ['spammer'], 'allowWords' => ['idiot']]);

$filter->findProfanity('sp4mmerko link');   // ['spammerko']
$filter->findProfanity('idiot muji');       // ['muji']
```

An unknown language or strictness throws an `InvalidArgumentException`.

## `Profanity::check($text, $options = [])`

```php
public static function check(string $text, array $options = []): ProfanityCheck

final class ProfanityCheck
{
    public readonly string $text;        // the text that was checked
    public readonly bool $hasProfanity;  // same as containsProfanity
    public readonly array $words;        // same as findProfanity
    public readonly array $matches;      // same as findProfanityMatches
    public function censor(array $options = []): string;
}
```

Scans the text once and returns everything the other methods would. `censor()` on the result reuses that scan,
so you can check and censor without scanning twice:

```php
$result = Profanity::check('you muji, F.U.C.K');

$result->hasProfanity;                     // true
$result->words;                            // ['muji', 'fuck']
$result->matches[0]->toArray();            // ['text' => 'muji', 'normalized' => 'muji', 'start' => 4, 'end' => 8]
$result->censor();                         // 'you ****, *******'
Profanity::check('you muji')->censor();    // 'you ****'
```

## `Profanity::containsProfanity($text, $options = [])`

```php
public static function containsProfanity(string $text, array $options = []): bool
```

Returns `true` if `$text` contains at least one active word, stem or phrase. It returns `false` for an empty string.

This is `count(Profanity::findProfanity($text, $options)) > 0`. It doesn't stop at the first match, so it takes about
as long as `findProfanity`.

```php
Profanity::containsProfanity('Great teacher!');   // false
Profanity::containsProfanity('IDIOT');            // true
```

## `Profanity::findProfanity($text, $options = [])` {#findprofanity}

```php
public static function findProfanity(string $text, array $options = []): array   // list<string>
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

```php
Profanity::findProfanity('f.u.c.k this sh1t');   // ['fuck', 'shit']
Profanity::findProfanity('fuuuuck');             // ['fuuuuck']
Profanity::findProfanity('gedaharu');            // ['gedaharu']
Profanity::findProfanity('मु‍जी');                // ['मुजी'] (zero-width joiner removed)
Profanity::findProfanity('p3sa g@rne taba');     // ['pesa garne']
Profanity::findProfanity('chaak ko pwal');       // ['chaak', 'chaak ko pwal']
```

The last example returns two results: `chaak` is listed as a single word, and it is also part of a listed phrase.

To find *where* each match is, use `findProfanityMatches`.

## `Profanity::findProfanityMatches($text, $options = [])` {#findprofanitymatches}

```php
public static function findProfanityMatches(string $text, array $options = []): array   // list<ProfanityMatch>

final class ProfanityMatch
{
    public string $text;         // exactly what the user typed, e.g. 'F.U.C.K'
    public string $normalized;   // the normalized form, e.g. 'fuck'
    public int $start;           // start index in the input, in characters
    public int $end;             // end index in the input, exclusive
    public function toArray(): array;
}
```

Returns every match with its position in the original text, sorted by position. Unlike `findProfanity`, repeated
words are listed once per occurrence.

`start` and `end` count characters (Unicode code points), not bytes, so
`mb_substr($text, $m->start, $m->end - $m->start) === $m->text`.

```php
array_map(fn ($m) => $m->toArray(), Profanity::findProfanityMatches('F.U.C.K this sh1t, muji. MUJI'));
// [
//   ['text' => 'F.U.C.K', 'normalized' => 'fuck', 'start' => 0,  'end' => 7],
//   ['text' => 'sh1t',    'normalized' => 'shit', 'start' => 13, 'end' => 17],
//   ['text' => 'muji',    'normalized' => 'muji', 'start' => 19, 'end' => 23],
//   ['text' => 'MUJI',    'normalized' => 'muji', 'start' => 25, 'end' => 29],
// ]
```

When a phrase contains a listed word, both are returned, with the longer match first:

```php
array_map(fn ($m) => $m->toArray(), Profanity::findProfanityMatches('chaak ko pwal'));
// [
//   ['text' => 'chaak ko pwal', 'normalized' => 'chaak ko pwal', 'start' => 0, 'end' => 13],
//   ['text' => 'chaak',         'normalized' => 'chaak',         'start' => 0, 'end' => 5],
// ]
```

## `Profanity::censor($text, $options = [])` {#censor}

```php
public static function censor(string $text, array $options = []): string
```

Returns the text with every match replaced. Everything else is left as it was. Besides `languages` and
`strictness`, `$options` takes:

- `mask`: replaces each visible character of a match, except whitespace. The default is `'*'`.
- `replace`: a callable that receives each `ProfanityMatch` and returns its replacement. It takes precedence over
  `mask`.

Overlapping matches are merged into one before they're replaced.

```php
Profanity::censor('you muji');                                       // 'you ****'
Profanity::censor('F.U.C.K this Sh1t!');                             // '******* this ****!'
Profanity::censor('you muji', ['mask' => '#']);                      // 'you ####'
Profanity::censor('you muji', ['replace' => fn ($m) => '[censored]']); // 'you [censored]'
Profanity::censor('fuck muji', ['languages' => ['romanized']]);      // 'fuck ****'
```

An empty `mask` throws an `InvalidArgumentException`. See [Censoring](./censoring.md) for more.

## `Profanity::createFilter($options = [])` {#createfilter}

```php
public static function createFilter(array $options = []): ProfanityFilter

final class ProfanityFilter
{
    public function check(string $text): ProfanityCheck;
    public function containsProfanity(string $text): bool;
    public function findProfanity(string $text): array;
    public function findProfanityMatches(string $text): array;
    public function censor(string $text, array $options = []): string;   // mask and replace
}
```

Builds a filter with fixed options. The lookup tables for those options are built once, when you call
`createFilter`. Use it when you check a lot of text with the same settings:

```php
$filter = Profanity::createFilter(['languages' => ['romanized'], 'strictness' => 'lenient']);

$filter->containsProfanity('muji');     // true
$filter->containsProfanity('murkha');   // false (a 'standard' word)
$filter->findProfanity('fuck muji');    // ['muji'] (English is off)
$filter->censor('fuck muji');           // 'fuck ****'
$filter->check('muji')->censor();       // '****'
```

The static methods also cache a filter for each combination of options. Passing options on every call is fine, but
`createFilter` makes the settings explicit and checks them once, up front.

## `Profanity::tokenize($text)` {#tokenize}

```php
public static function tokenize(string $text): array   // list<string>
```

Returns the tokens that the matcher checks against the word lists. Use it to find out why a word was caught or missed.

```php
Profanity::tokenize('Great teacher!');   // ['great', 'teacher']
Profanity::tokenize('f*ck this!');       // ['f*ck', 'this']
Profanity::tokenize('m u j i ko');       // ['muji', 'ko']
Profanity::tokenize('सीता कार्की');        // ['सीता', 'कार्की']
```

A run of three or more single letters is joined into one token. That is how `f u c k` and `f.u.c.k` are caught.

## `Lexicon`

A class holding the word lists as constants.

**Tagged entries.** Each entry is an array:

```php
['text' => 'muji', 'language' => 'romanized', 'strictness' => 'lenient']
// strictness is the lowest strictness that turns this entry on
```

| Constant | Matched how |
|---|---|
| `Lexicon::WORDS` | Whole token, after normalization. A trailing postposition is removed first. |
| `Lexicon::STEMS` | The token starts with the stem. For example, `fuck` catches `fucking`. |
| `Lexicon::PHRASES` | Words in sequence, separated by any whitespace. |
| `Lexicon::INFIXES` | Anywhere inside a Latin token, so `fuck` catches `dumbfuck`. Only roots no ordinary word contains are here. |

```php
array_filter(Lexicon::WORDS, fn ($e) => $e['language'] === 'romanized' && $e['strictness'] === 'standard');
```

**Flat lists.** These methods return every entry in one script, at every strictness, as a list of strings:

- `Lexicon::latinWords()`, `latinStems()`, `latinPhrases()` and `latinInfixes()` cover English and Romanized Nepali.
- `Lexicon::ALLOWED` holds the ordinary words and names that are never flagged, like `Randip`, `Shitij` and `Scunthorpe`.
- `Lexicon::devanagariWords()`, `devanagariStems()` and `devanagariPhrases()` cover Devanagari.

**Postpositions.** `Lexicon::LATIN_SUFFIXES` (`ko`, `lai`, `haru`…) and `Lexicon::DEVANAGARI_SUFFIXES` (`को`, `लाई`,
`हरू`…) are removed before the whole-word check. They apply at every language and strictness setting.

The matcher builds its lookup tables from these lists. To flag or allow words for your app only, use the
[`extraWords` and `allowWords` options](#extrawords-and-allowwords). To change the lists for everyone, see
[The lexicon](./lexicon.md).
