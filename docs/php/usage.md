# Usage

## Check a piece of text

`Profanity::containsProfanity` returns `true` or `false`:

```php
use NoNepaliProfanity\Profanity;

Profanity::containsProfanity('Great teacher!');   // false
Profanity::containsProfanity('muji');             // true
Profanity::containsProfanity('मुजीको क्लास');      // true (Devanagari with a postposition)
Profanity::containsProfanity('sh!t lecturer');    // true (! used as i)
```

## Find out what matched

`Profanity::findProfanity` returns the words that matched. Use it to show a moderator why something was flagged, or to
log it:

```php
Profanity::findProfanity('f.u.c.k this sh1t');     // ['fuck', 'shit']
Profanity::findProfanity('what the f*ck, sh*t');   // ['f*ck', 'sh*t']
Profanity::findProfanity('Muji muji MUJI');        // ['muji'] (duplicates removed)
Profanity::findProfanity('Shitij Adhikari');       // []
```

The results are **normalized**: lowercased, with leetspeak decoded. They aren't the exact text the user typed. See
[`findProfanity`](./api.md#findprofanity) for the details.

## Censor text

`Profanity::censor` masks every match and leaves the rest of the text alone:

```php
Profanity::censor('you muji');                  // 'you ****'
Profanity::censor('F.U.C.K this Sh1t!');        // '******* this ****!'
Profanity::censor('you muji', ['mask' => '#']); // 'you ####'
```

## Check and censor in one pass

`Profanity::check` scans the text once and returns a result you can inspect and then censor. It's the way to chain
the two:

```php
$result = Profanity::check('you muji');

if ($result->hasProfanity) {
    error_log(implode(', ', $result->words)); // muji
}
$result->censor();                           // 'you ****'
Profanity::check('you muji')->censor();      // 'you ****'
```

See [Censoring](./censoring.md) for masks, custom replacements and what exactly gets masked.

## Choose which languages to check

By default, all three languages are checked. Pass `languages` to check only some of them:

```php
// Only Romanized Nepali
Profanity::containsProfanity('fuck', ['languages' => ['romanized']]);   // false
Profanity::containsProfanity('muji', ['languages' => ['romanized']]);   // true

// Nepali in both scripts, but not English
Profanity::findProfanity('fuck muji मुजी', ['languages' => ['romanized', 'devanagari']]);   // ['muji', 'मुजी']
```

| Language | Covers |
|---|---|
| `'english'` | English profanity and insults. |
| `'romanized'` | Nepali written in Latin letters, plus Hindi slang common in Nepal. |
| `'devanagari'` | Nepali written in Devanagari. |

## Choose how strict to be

`strictness` sets how much is caught. The default is `'standard'`.

| Strictness | Catches | Use it for |
|---|---|---|
| `'lenient'` | Severe profanity and slurs only. | Casual communities where mild insults are fine. |
| `'standard'` | The above, plus milder insults like `idiot`, `murkha` and `sala`. | Most sites. |
| `'strict'` | The above, plus word stems that also match ordinary words and names. | Moderation queues reviewed by a person. |

```php
Profanity::containsProfanity('you idiot', ['strictness' => 'lenient']);         // false
Profanity::containsProfanity('you idiot');                                      // true

Profanity::findProfanity('damn it');                               // []
Profanity::findProfanity('damn it', ['strictness' => 'strict']);   // ['damn']
```

::: warning
`'strict'` still flags a few ordinary words, like `damn` and `prick`. Names and
words its stems would hit, like `Randip` and `conditions`, are on a built-in allow list.
:::

## Reuse a filter

If you check a lot of text with the same options, create a filter once and reuse it:

```php
$filter = Profanity::createFilter(['languages' => ['romanized', 'devanagari'], 'strictness' => 'lenient']);

$filter->containsProfanity('muji');    // true
$filter->findProfanity('fuck muji');   // ['muji']
```

`createFilter` checks the options once and throws an `InvalidArgumentException` if they're invalid, which surfaces
mistakes when your app starts rather than on the first request. The static methods also cache a filter for each set
of options, so passing options on every call is still fast.

## Debug a match

If a word is flagged or missed unexpectedly, `Profanity::tokenize` shows the words the filter actually checked:

```php
Profanity::tokenize('Great teacher!');   // ['great', 'teacher']
Profanity::tokenize('f*ck this!');       // ['f*ck', 'this']
Profanity::tokenize('m u j i ko');       // ['muji', 'ko']
```

[How matching works](./how-it-works.md) explains each step.
