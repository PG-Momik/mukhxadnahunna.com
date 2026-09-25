# FAQ

## Can it replace bad words with `****`?

Yes. Use `censor`, or `check(text).censor()` if you also want to know what matched:

```dart
censor('you muji');             // 'you ****'
check('you muji').censor();     // 'you ****'
```

See [Censoring](./censoring.md).

## Can I highlight matches instead of hiding them?

Yes. Use the positions from `findProfanityMatches` to build a `TextSpan`. See
[Highlight matches](./examples.md#highlight-matches).

## Can I add my own words?

Yes. Pass `extraWords` to flag more words, and `allowWords` to never flag a word, such as a name on your site:

```dart
final filter = ProfanityFilter(extraWords: ['someword'], allowWords: ['somename']);

filter.containsProfanity('s0mew0rd');   // true
```

Extra words are matched like the built-in ones, so leetspeak, stretched letters and postpositions are still caught.
To add words for everyone, see [Contributing](./contributing.md).

## Why was this word flagged?

Run the text through `findProfanity` to see which word matched, and `tokenize` to see the words the filter checked:

```dart
findProfanity('damn it', strictness: Strictness.strict);   // ['damn']
tokenize('damn it');                                       // ['damn', 'it']
```

If an ordinary word or a name is flagged at the standard or lenient level, please
[report it](./contributing.md#reporting-a-problem).

## Why wasn't this word caught?

It's probably not in the word lists, or it's in a stricter level than the one you use. Check the lexicon:

```dart
lexicon.words.firstWhere((e) => e.text == 'idiot');
// LexiconEntry(idiot, english, standard)
```

If it isn't there, [suggest it](./contributing.md).

## Which strictness should I use?

Use the default, `Strictness.standard`, for most apps. Use `Strictness.lenient` if mild insults are fine in your
community. Use `Strictness.strict` only when a person reviews what gets flagged, because it catches a few ordinary
words, like *damn*. See [Block severe words, review the rest](./examples.md#block-severe-words-review-the-rest).

## Is checking in the app enough?

No. Anyone can call your API directly, so check again on your server before saving anything. Checking in the app is
still useful for warning people as they type. Every port gives the same results, so your server can be in JavaScript,
Python, Go, PHP or Dart.

## Is it fast?

Yes, for typical user text like comments, reviews and names. A filter builds its lookup tables once, and each check
is a single pass over the words in the text. It's fast enough to run on every keystroke. To both check and censor,
use `check(text)`, which reuses one scan for both.

## Does it give the same results as the JavaScript package?

Yes. Every port uses the same word lists and matching rules, and is tested against the JavaScript package's output.
Dart strings are UTF-16, like JavaScript's, so even the match positions are the same.
