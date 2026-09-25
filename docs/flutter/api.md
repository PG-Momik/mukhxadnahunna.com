# API reference

```dart
import 'package:no_nepali_profanity/no_nepali_profanity.dart';
// check, containsProfanity, findProfanity, findProfanityMatches, censor, tokenize,
// ProfanityFilter, ProfanityCheck, ProfanityMatch, Language, Strictness, Replacer

import 'package:no_nepali_profanity/lexicon.dart' as lexicon;
```

## Options

`check`, `containsProfanity`, `findProfanity`, `findProfanityMatches`, `censor` and `ProfanityFilter` all take the
same optional named arguments:

```dart
Iterable<Language>? languages,               // default: all three
Strictness strictness = Strictness.standard,
Iterable<String> extraWords = const [],      // more words to flag
Iterable<String> allowWords = const [],      // words never to flag

enum Language { english, romanized, devanagari }
enum Strictness { lenient, standard, strict }
```

### `languages`

Sets which word lists are checked. Leave a language out to turn it off.

| Value | Checks |
|---|---|
| `Language.english` | English profanity (`fuck`, `bitch`, `idiot`…). |
| `Language.romanized` | Nepali written in Latin letters, plus Hindi slang common in Nepal (`muji`, `chutiya`, `sasto manche`…). |
| `Language.devanagari` | Nepali written in Devanagari (`मुजी`, `सस्तो मान्छे`…). |

```dart
findProfanity('fuck muji मुजी', languages: [Language.romanized]);                         // ['muji']
findProfanity('fuck muji मुजी', languages: [Language.english, Language.devanagari]);      // ['fuck', 'मुजी']
```

An empty list turns every language off, so nothing is ever flagged.

### `strictness`

Sets how much is caught. Each level includes everything from the levels below it.

| Level | Adds |
|---|---|
| `Strictness.lenient` | Severe profanity and slurs only. |
| `Strictness.standard` (default) | Milder insults: `idiot`, `stupid`, `murkha`, `sala`, `kutta`, `sasto manche`… |
| `Strictness.strict` | Words and stems that are also ordinary words: `damn`, `cum`, `prick`, and the stems `rand`, `cond`, `kand` and `lund`. The names and words those stems would hit most, like `Randip`, `conditions` and `Kandel`, are on a built-in allow list and stay clean. |

```dart
containsProfanity('you idiot', strictness: Strictness.lenient);        // false
containsProfanity('you idiot');                                        // true
findProfanity('damn it');                                              // []
findProfanity('damn it', strictness: Strictness.strict);               // ['damn']
findProfanity('Randip read the conditions', strictness: Strictness.strict);  // []
```

`Strictness.strict` still catches a few ordinary words, like *damn* and *prick*. Use it where that's the policy you
want, or in a moderation queue that a person reviews.

### `extraWords` and `allowWords`

Adds words to flag and words never to flag. Extra words count at every strictness and are matched like the built-in
ones, so leetspeak, stretched letters and postpositions are still caught. Allowed words are never flagged, with or
without a postposition, which is how to keep a name on your site from matching a stem.

```dart
final filter = ProfanityFilter(extraWords: ['spammer'], allowWords: ['idiot']);

filter.findProfanity('sp4mmerko link');   // ['spammerko']
filter.findProfanity('idiot muji');       // ['muji']
```

## `check`

```dart
ProfanityCheck check(String text, {Iterable<Language>? languages, Strictness strictness = Strictness.standard})

class ProfanityCheck {
  final String text;                    // the text that was checked
  final bool hasProfanity;              // same as containsProfanity
  final List<String> words;             // same as findProfanity
  final List<ProfanityMatch> matches;   // same as findProfanityMatches
  String censor({String mask = '*', Replacer? replace});
}
```

Scans the text once and returns everything the other functions would. `censor()` on the result reuses that scan,
so you can check and censor without scanning twice:

```dart
final result = check('you muji, F.U.C.K');

result.hasProfanity;          // true
result.words;                 // ['muji', 'fuck']
result.matches[0];            // const ProfanityMatch(text: 'muji', normalized: 'muji', start: 4, end: 8)
result.censor();              // 'you ****, *******'
check('you muji').censor();   // 'you ****'
```

## `containsProfanity`

```dart
bool containsProfanity(String text, {Iterable<Language>? languages, Strictness strictness = Strictness.standard})
```

Returns `true` if `text` contains at least one active word, stem or phrase. It returns `false` for an empty string.

This is `findProfanity(text).isNotEmpty`. It doesn't stop at the first match, so it takes about as long as
`findProfanity`.

```dart
containsProfanity('Great teacher!');   // false
containsProfanity('IDIOT');            // true
```

## `findProfanity`

```dart
List<String> findProfanity(String text, {Iterable<Language>? languages, Strictness strictness = Strictness.standard})
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

```dart
findProfanity('f.u.c.k this sh1t');    // ['fuck', 'shit']
findProfanity('fuuuuck');              // ['fuuuuck']
findProfanity('gedaharu');             // ['gedaharu']
findProfanity('मु‍जी');                 // ['मुजी'] (zero-width joiner removed)
findProfanity('p3sa g@rne taba');      // ['pesa garne']
findProfanity('chaak ko pwal');        // ['chaak', 'chaak ko pwal']
```

The last example returns two results: `chaak` is listed as a single word, and it is also part of a listed phrase.

To find *where* each match is, use `findProfanityMatches`.

## `findProfanityMatches`

```dart
List<ProfanityMatch> findProfanityMatches(String text,
    {Iterable<Language>? languages, Strictness strictness = Strictness.standard})

class ProfanityMatch {
  final String text;         // exactly what the user typed, e.g. 'F.U.C.K'
  final String normalized;   // the normalized form, e.g. 'fuck'
  final int start;           // start index in the input
  final int end;             // end index in the input, exclusive
}
```

Returns every match with its position in the original text, sorted by position. Unlike `findProfanity`, repeated
words are listed once per occurrence.

`start` and `end` are UTF-16 indexes, the same as `String.substring` uses, so
`text.substring(match.start, match.end) == match.text`. `ProfanityMatch` has value equality.

```dart
findProfanityMatches('F.U.C.K this sh1t, muji. MUJI');
// [
//   ProfanityMatch(text: 'F.U.C.K', normalized: 'fuck', start: 0,  end: 7),
//   ProfanityMatch(text: 'sh1t',    normalized: 'shit', start: 13, end: 17),
//   ProfanityMatch(text: 'muji',    normalized: 'muji', start: 19, end: 23),
//   ProfanityMatch(text: 'MUJI',    normalized: 'muji', start: 25, end: 29),
// ]
```

When a phrase contains a listed word, both are returned, with the longer match first:

```dart
findProfanityMatches('chaak ko pwal');
// [
//   ProfanityMatch(text: 'chaak ko pwal', normalized: 'chaak ko pwal', start: 0, end: 13),
//   ProfanityMatch(text: 'chaak',         normalized: 'chaak',         start: 0, end: 5),
// ]
```

## `censor`

```dart
String censor(String text,
    {Iterable<Language>? languages,
    Strictness strictness = Strictness.standard,
    String mask = '*',
    Replacer? replace})

typedef Replacer = String Function(ProfanityMatch match);
```

Returns the text with every match replaced. Everything else is left as it was.

- `mask` replaces each visible character of a match, except whitespace.
- `replace` receives each match and returns its replacement. It takes precedence over `mask`.
- Overlapping matches are merged into one before they're replaced.

```dart
censor('you muji');                                  // 'you ****'
censor('F.U.C.K this Sh1t!');                        // '******* this ****!'
censor('you muji', mask: '#');                       // 'you ####'
censor('you muji', replace: (m) => '[censored]');    // 'you [censored]'
censor('fuck muji', languages: [Language.romanized]);  // 'fuck ****'
```

An empty `mask` throws an `ArgumentError`. See [Censoring](./censoring.md) for more.

## `ProfanityFilter`

```dart
class ProfanityFilter {
  ProfanityFilter({Iterable<Language>? languages, Strictness strictness = Strictness.standard});

  ProfanityCheck check(String text);
  bool containsProfanity(String text);
  List<String> findProfanity(String text);
  List<ProfanityMatch> findProfanityMatches(String text);
  String censor(String text, {String mask = '*', Replacer? replace});
}
```

Builds a filter with fixed options. The lookup tables for those options are built once, when you create it. Use it
when you check a lot of text with the same settings:

```dart
final filter = ProfanityFilter(languages: [Language.romanized], strictness: Strictness.lenient);

filter.containsProfanity('muji');     // true
filter.containsProfanity('murkha');   // false (a standard word)
filter.findProfanity('fuck muji');    // ['muji'] (English is off)
filter.censor('fuck muji');           // 'fuck ****'
filter.check('muji').censor();        // '****'
```

The top-level functions also cache a filter for each combination of options. Passing options on every call is fine,
but a `ProfanityFilter` makes the settings explicit.

## `tokenize`

```dart
List<String> tokenize(String text)
```

Returns the tokens that the matcher checks against the word lists. Use it to find out why a word was caught or missed.

```dart
tokenize('Great teacher!');    // ['great', 'teacher']
tokenize('f*ck this!');        // ['f*ck', 'this']
tokenize('m u j i ko');        // ['muji', 'ko']
tokenize('सीता कार्की');         // ['सीता', 'कार्की']
```

A run of three or more single letters is joined into one token. That is how `f u c k` and `f.u.c.k` are caught.

## `lexicon`

A separate library containing the word lists. Every list is unmodifiable.

```dart
import 'package:no_nepali_profanity/lexicon.dart' as lexicon;
```

**Tagged entries.** Each entry is a `LexiconEntry`:

```dart
class LexiconEntry {
  final String text;
  final Language language;
  final Strictness strictness;   // the lowest strictness that turns this entry on
}
```

| List | Matched how |
|---|---|
| `lexicon.words` | Whole token, after normalization. A trailing postposition is removed first. |
| `lexicon.stems` | The token starts with the stem. For example, `fuck` catches `fucking`. |
| `lexicon.phrases` | Words in sequence, separated by any whitespace. |
| `lexicon.infixes` | Anywhere inside a Latin token, so `fuck` catches `dumbfuck`. Only roots no ordinary word contains are here. |

```dart
lexicon.words.where((e) => e.language == Language.romanized && e.strictness == Strictness.standard);
```

**Flat lists.** These `List<String>` lists hold every entry in one script, at every strictness:

- `latinWords`, `latinStems`, `latinPhrases` and `latinInfixes` cover English and Romanized Nepali.
- `allowed` holds the ordinary words and names that are never flagged, like `Randip`, `Shitij` and `Scunthorpe`.
- `devanagariWords`, `devanagariStems` and `devanagariPhrases` cover Devanagari.

**Postpositions.** `latinSuffixes` (`ko`, `lai`, `haru`…) and `devanagariSuffixes` (`को`, `लाई`, `हरू`…) are removed
before the whole-word check. They apply at every language and strictness setting.

The matcher builds its lookup tables from these lists. To flag or allow words for your app only, use the
[`extraWords` and `allowWords` options](#extrawords-and-allowwords). To change the lists for everyone, see
[The lexicon](./lexicon.md).
