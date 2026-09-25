# Usage

## Check a piece of text

`containsProfanity` returns `true` or `false`:

```dart
containsProfanity('Great teacher!');   // false
containsProfanity('muji');             // true
containsProfanity('मुजीको क्लास');      // true (Devanagari with a postposition)
containsProfanity('sh!t lecturer');    // true (! used as i)
```

## Find out what matched

`findProfanity` returns the words that matched. Use it to show a moderator why something was flagged, or to log it:

```dart
findProfanity('f.u.c.k this sh1t');      // ['fuck', 'shit']
findProfanity('what the f*ck, sh*t');    // ['f*ck', 'sh*t']
findProfanity('Muji muji MUJI');         // ['muji'] (duplicates removed)
findProfanity('Shitij Adhikari');        // []
```

The results are **normalized**: lowercased, with leetspeak decoded. They aren't the exact text the user typed. See
[`findProfanity`](./api.md#findprofanity) for the details.

## Censor text

`censor` masks every match and leaves the rest of the text alone:

```dart
censor('you muji');                 // 'you ****'
censor('F.U.C.K this Sh1t!');       // '******* this ****!'
censor('you muji', mask: '#');      // 'you ####'
```

## Check and censor in one pass

`check` scans the text once and returns a result you can inspect and then censor. It's the way to chain the two:

```dart
final result = check('you muji');

if (result.hasProfanity) {
  print(result.words); // [muji]
}
result.censor();              // 'you ****'
check('you muji').censor();   // 'you ****'
```

See [Censoring](./censoring.md) for masks, custom replacements and what exactly gets masked.

## Choose which languages to check

By default, all three languages are checked. Pass `languages` to check only some of them:

```dart
// Only Romanized Nepali
containsProfanity('fuck', languages: [Language.romanized]);   // false
containsProfanity('muji', languages: [Language.romanized]);   // true

// Nepali in both scripts, but not English
findProfanity('fuck muji मुजी', languages: [Language.romanized, Language.devanagari]);   // ['muji', 'मुजी']
```

| Language | Covers |
|---|---|
| `Language.english` | English profanity and insults. |
| `Language.romanized` | Nepali written in Latin letters, plus Hindi slang common in Nepal. |
| `Language.devanagari` | Nepali written in Devanagari. |

## Choose how strict to be

`strictness` sets how much is caught. The default is `Strictness.standard`.

| Strictness | Catches | Use it for |
|---|---|---|
| `Strictness.lenient` | Severe profanity and slurs only. | Casual communities where mild insults are fine. |
| `Strictness.standard` | The above, plus milder insults like `idiot`, `murkha` and `sala`. | Most apps. |
| `Strictness.strict` | The above, plus word stems that also match ordinary words and names. | Moderation queues reviewed by a person. |

```dart
containsProfanity('you idiot', strictness: Strictness.lenient);        // false
containsProfanity('you idiot');                                        // true

findProfanity('damn it');                                 // []
findProfanity('damn it', strictness: Strictness.strict);  // ['damn']
```

::: warning
`Strictness.strict` still flags a few ordinary words, like `damn` and `prick`. Names and
words its stems would hit, like `Randip` and `conditions`, are on a built-in allow list.
:::

## Reuse a filter

If you check a lot of text with the same options, create a filter once and reuse it:

```dart
final filter = ProfanityFilter(
  languages: [Language.romanized, Language.devanagari],
  strictness: Strictness.lenient,
);

filter.containsProfanity('muji');    // true
filter.findProfanity('fuck muji');   // ['muji']
```

Languages and strictness are enums, so an invalid option is a compile error. The top-level functions also cache a
filter for each set of options, so passing options on every call is still fast.

## Debug a match

If a word is flagged or missed unexpectedly, `tokenize` shows the words the filter actually checked:

```dart
tokenize('Great teacher!');   // ['great', 'teacher']
tokenize('f*ck this!');       // ['f*ck', 'this']
tokenize('m u j i ko');       // ['muji', 'ko']
```

[How matching works](./how-it-works.md) explains each step.
