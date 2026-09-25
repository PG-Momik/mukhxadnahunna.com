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

Yes. Pass `extraWords` to flag more words, and `allowWords` to never flag a word, such as a name on your site:

```php
use NoNepaliProfanity\Profanity;

$filter = Profanity::createFilter(['extraWords' => ['someword'], 'allowWords' => ['somename']]);

$filter->containsProfanity('s0mew0rd');   // true
```

Extra words are matched like the built-in ones, so leetspeak, stretched letters and postpositions are still caught.
To add words for everyone, see [Contributing](./contributing.md).

## Why was this word flagged?

Run the text through `findProfanity` to see which word matched, and `tokenize` to see the words the filter checked:

```php
Profanity::findProfanity('damn it', ['strictness' => 'strict']);   // ['damn']
Profanity::tokenize('damn it');                                    // ['damn', 'it']
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
`'strict'` only when a person reviews what gets flagged, because it catches a few ordinary words, like *damn*. See
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
