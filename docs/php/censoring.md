# Censoring

`Profanity::censor` returns the text with every match masked. Everything else, including spacing, punctuation and
emoji, is left as it was.

```php
use NoNepaliProfanity\Profanity;

Profanity::censor('you muji');             // 'you ****'
Profanity::censor('F.U.C.K this Sh1t!');   // '******* this ****!'
Profanity::censor('मुजीको क्लास');          // '*** क्लास'
Profanity::censor('Great teacher!');       // 'Great teacher!'
```

## Check and censor in one pass

To find out whether text has profanity *and* get a censored copy, use `Profanity::check`. It scans the text once and
returns a result you can read and then censor, so you don't pay for a second scan:

```php
$result = Profanity::check('you muji, F.U.C.K');

$result->hasProfanity;   // true
$result->words;          // ['muji', 'fuck']
$result->censor();       // 'you ****, *******'
```

Because `censor()` is a method on the result, you can chain it:

```php
Profanity::check('you muji')->censor();                  // 'you ****'
Profanity::check('you muji')->censor(['mask' => '#']);   // 'you ####'
```

A common pattern is to save the censored text and flag the original for a moderator:

```php
$result = Profanity::check($comment['body']);

$insert = $pdo->prepare('INSERT INTO comments (body, flagged, flagged_words) VALUES (?, ?, ?)');
$insert->execute([$result->censor(), (int) $result->hasProfanity, implode(',', $result->words)]);
```

Calling `containsProfanity($text)` and then `censor($text)` gives the same result, but scans the text twice.

## Change the mask

`mask` sets the character used in place of each character of a match. The default is `*`.

```php
Profanity::censor('you muji', ['mask' => '#']);   // 'you ####'
Profanity::censor('you muji', ['mask' => '•']);   // 'you ••••'
```

## Custom replacements

`replace` receives each match and returns the text to put in its place. It takes precedence over `mask`.

```php
use NoNepaliProfanity\ProfanityMatch;

// A fixed label
Profanity::censor('you muji', ['replace' => fn (ProfanityMatch $m) => '[censored]']);
// 'you [censored]'

// Keep the first letter
Profanity::censor('you muji', ['replace' => fn (ProfanityMatch $m) => mb_substr($m->text, 0, 1) . str_repeat('*', mb_strlen($m->text) - 1)]);
// 'you m***'

// Grawlix
Profanity::censor('you muji', ['replace' => fn (ProfanityMatch $m) => mb_substr(str_repeat('@#$%&!', mb_strlen($m->text)), 0, mb_strlen($m->text))]);
// 'you @#$%'

// Wrap it for your UI instead of hiding it
Profanity::censor('you muji', ['replace' => fn (ProfanityMatch $m) => "<mark>{$m->text}</mark>"]);
// 'you <mark>muji</mark>'
```

The match object is the same as the one returned by [`findProfanityMatches`](./api.md#findprofanitymatches):

| Property | Example | Meaning |
|---|---|---|
| `text` | `'F.U.C.K'` | Exactly what the user typed. |
| `normalized` | `'fuck'` | The normalized form that matched. |
| `start` | `0` | Start index in the input, in characters. |
| `end` | `7` | End index in the input, exclusive. |

::: warning Escape HTML
If the output goes into HTML, escape the text first. A `replace` function that returns markup, like the `<mark>`
example above, only receives the matched text, not the rest of the input.
:::

## With filter options

`censor` and `check` accept the same `languages` and `strictness` options as every other method:

```php
Profanity::censor('fuck muji', ['languages' => ['romanized']]);          // 'fuck ****'
Profanity::censor('you idiot', ['strictness' => 'lenient']);             // 'you idiot'
Profanity::check('you idiot', ['strictness' => 'lenient'])->censor();    // 'you idiot'
```

A filter from `createFilter` has `check` and `censor` too:

```php
$filter = Profanity::createFilter(['languages' => ['romanized', 'devanagari']]);

$filter->censor('fuck muji');          // 'fuck ****'
$filter->check('मुजी')->censor();      // '**'
```

## What gets masked

- **Exactly the characters the user typed.** Positions are traced back through normalization, so leetspeak
  (`Sh1t`), `!` for `i` (`sh!!t`), full-width letters (`ＦＵＣＫ`) and zero-width characters are masked in full.
- **Spelled-out words, dots included.** `F.U.C.K` becomes `*******`.
- **One mask character per visible character.** Devanagari is counted by what you see, not by byte or code point,
  so `मुजी` becomes `**`, not `****`.
- **Whitespace inside a phrase is kept.** `sasto manche` becomes `***** ******`.
- **Overlapping matches are merged.** `chaak ko pwal` is a phrase that contains the word `chaak`, and it's masked
  once, as `***** ** ****`.
- **Postpositions are masked with the word.** `mujiko` becomes `******`, because the filter reads it as one word.
