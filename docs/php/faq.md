# FAQ

## Can it replace bad words with `****`?

Yes. Use `Profanity::censor`, or `Profanity::check($text)->censor()` if you also want to know what matched:

```php
Profanity::censor('you muji');              // 'you ****'
Profanity::check('you muji')->censor();     // 'you ****'
```

See [Censoring](./censoring.md).

## Can I highlight matches instead of hiding them?

Yes. Pass a `replace` callable to `censor`, or use the positions from `findProfanityMatches`:

```php
Profanity::censor('you muji', ['replace' => fn ($m) => "<mark>{$m->text}</mark>"]);   // 'you <mark>muji</mark>'
```

Escape the rest of the text first if it goes into HTML. See
[Highlight matches for moderators](./examples.md#highlight-matches-for-moderators).

## Can I add my own words?

Not at runtime. The word lists are built into the package. To add words for everyone, see
[Contributing](./contributing.md). To add words only for your app, run your own check alongside the filter:

```php
use NoNepaliProfanity\Profanity;

function isBlocked(string $text): bool
{
    $extra = ['someword', 'anotherword'];
    $words = preg_split('/\s+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);
    return Profanity::containsProfanity($text) || array_intersect($words, $extra) !== [];
}
```

## Why was this word flagged?

Run the text through `findProfanity` to see which word matched, and `tokenize` to see the words the filter checked:

```php
Profanity::findProfanity('terms and conditions', ['strictness' => 'strict']);   // ['conditions']
Profanity::tokenize('terms and conditions');                                    // ['terms', 'and', 'conditions']
```

If an ordinary word or a name is flagged at `'standard'` or `'lenient'`, please
[report it](./contributing.md#reporting-a-problem).

## Why wasn't this word caught?

It's probably not in the word lists, or it's in a stricter level than the one you use. Check the lexicon:

```php
use NoNepaliProfanity\Lexicon;

array_values(array_filter(Lexicon::WORDS, fn ($e) => $e['text'] === 'idiot'));
// [['text' => 'idiot', 'language' => 'english', 'strictness' => 'standard']]
```

If it isn't there, [suggest it](./contributing.md).

## Which strictness should I use?

Use the default, `'standard'`, for most sites. Use `'lenient'` if mild insults are fine in your community. Use
`'strict'` only when a person reviews what gets flagged, because it catches some ordinary words and names. See
[Block severe words, review the rest](./examples.md#block-severe-words-review-the-rest).

## Does it work with Laravel, Symfony or WordPress?

Yes. It's plain PHP with no framework dependencies, so you can call it from a validation rule, a controller or a
filter hook in any of them.

## Is it fast?

Yes, for typical user text like comments, reviews and names. A filter builds its lookup tables once per request, and
each check is a single pass over the words in the text. To both check and censor, use `Profanity::check($text)`,
which reuses one scan for both.

## Does it give the same results as the JavaScript package?

Yes. Every port uses the same word lists and matching rules, and is tested against the JavaScript package's output.
The one difference is how match positions are counted: in PHP, `start` and `end` count characters (code points),
where JavaScript counts UTF-16 code units. Slice with `mb_substr` to get the matched text.
