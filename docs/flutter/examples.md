# Examples

## Validate a form field

Reject a display name or comment when the form is submitted. `validator` returns an error message, or `null` when the
value is fine:

```dart
String? noProfanity(String? value) {
  if (value != null && containsProfanity(value)) {
    return 'Please choose a different name.';
  }
  return null;
}
```

```dart
TextFormField(
  decoration: const InputDecoration(labelText: 'Display name'),
  validator: noProfanity,
)
```

```dart
noProfanity('Shitij Adhikari');   // null
noProfanity('muji123');           // 'Please choose a different name.'
```

Don't show the matched words back to the user. That tells them exactly which spelling to try next.

## Warn while typing

Show a warning under the field as the user types, before they submit. Your server still has to check again, because
an app check is easy to bypass.

```dart
class CommentField extends StatefulWidget {
  const CommentField({super.key});

  @override
  State<CommentField> createState() => _CommentFieldState();
}

class _CommentFieldState extends State<CommentField> {
  bool _flagged = false;

  @override
  Widget build(BuildContext context) {
    return TextField(
      maxLines: null,
      onChanged: (text) => setState(() => _flagged = containsProfanity(text)),
      decoration: InputDecoration(
        labelText: 'Comment',
        errorText: _flagged ? "Your comment contains language that isn't allowed." : null,
      ),
    );
  }
}
```

## Check and censor in one pass

`check` scans a comment once. Read the result to decide what to do, then call `censor()` to get the masked text
without scanning again:

```dart
Future<void> saveComment(String body) async {
  final result = check(body);

  if (result.hasProfanity) {
    debugPrint('Censored comment: ${result.words}');
  }

  await FirebaseFirestore.instance.collection('comments').add({
    'body': result.censor(), // 'you ****' for 'you muji'
    'flagged': result.hasProfanity,
  });
}
```

For a one-off, chain it directly:

```dart
check('you muji').censor();                                  // 'you ****'
check('you muji').censor(mask: '#');                         // 'you ####'
check('fuck muji', languages: [Language.romanized]).censor();  // 'fuck ****'
```

## Censor comments before display

Store what users write, and censor it when you show it. That way you can change the strictness later without
touching stored data:

```dart
final commentFilter = ProfanityFilter(strictness: Strictness.standard);

class CommentTile extends StatelessWidget {
  const CommentTile({super.key, required this.body});

  final String body;

  @override
  Widget build(BuildContext context) => ListTile(title: Text(commentFilter.censor(body)));
}
```

```dart
commentFilter.censor('yo exam muji jasto thiyo');   // 'yo exam **** ***** thiyo'
```

## Highlight matches

Style each match instead of hiding it, for a moderator's view. Build a `TextSpan` from the positions returned by
`findProfanityMatches`:

```dart
TextSpan highlight(String text, {TextStyle? matchStyle}) {
  final spans = <TextSpan>[];
  var last = 0;
  for (final m in findProfanityMatches(text)) {
    if (m.start < last) continue; // skip a word inside a phrase that is already highlighted
    spans.add(TextSpan(text: text.substring(last, m.start)));
    spans.add(TextSpan(text: m.text, style: matchStyle ?? const TextStyle(backgroundColor: Color(0xFFFFE082))));
    last = m.end;
  }
  spans.add(TextSpan(text: text.substring(last)));
  return TextSpan(children: spans);
}
```

```dart
Text.rich(highlight('you muji <3'))
```

## Block severe words, review the rest

Use two filters to split incoming text three ways:

- Text with severe profanity is rejected automatically.
- Text that only the stricter filter flags goes to a moderator.
- Everything else is published.

This way, false positives from `Strictness.strict`, like the name *Randip*, reach a person instead of being blocked.

```dart
final block = ProfanityFilter(strictness: Strictness.lenient);
final review = ProfanityFilter(strictness: Strictness.strict);

String moderate(String text) {
  if (block.containsProfanity(text)) return 'reject';
  if (review.containsProfanity(text)) return 'review';
  return 'publish';
}
```

```dart
moderate('muji');             // 'reject'
moderate('you idiot');        // 'review'
moderate('Randip Thapa');     // 'review'
moderate('Great teacher!');   // 'publish'
```

## Nepali only

If your community allows English swearing but not Nepali abuse, turn English off:

```dart
final nepali = ProfanityFilter(languages: [Language.romanized, Language.devanagari]);

nepali.containsProfanity('this exam was shit');   // false
nepali.containsProfanity('yo exam muji jasto');   // true
nepali.containsProfanity('मुजी जस्तो');            // true
```

## Reject profanity on a Dart server

The same check in a `shelf` handler, so bad posts are rejected however they reach your API:

```dart
Future<Response> createComment(Request request) async {
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  final flagged = ['title', 'body'].where((field) {
    final value = body[field];
    return value is String && containsProfanity(value);
  }).toList();

  if (flagged.isNotEmpty) {
    return Response(422,
        body: jsonEncode({'error': "Your post contains language that isn't allowed.", 'fields': flagged}),
        headers: {'content-type': 'application/json'});
  }

  // save the comment…
  return Response(201);
}
```

## Scan existing content

Check content that was saved before you added the filter, and write out what matched for review:

```dart
Future<void> scanComments(List<({int id, String body})> comments) async {
  final filter = ProfanityFilter(strictness: Strictness.strict);

  final report = [
    for (final c in comments)
      if (filter.findProfanity(c.body) case final hits when hits.isNotEmpty) {'id': c.id, 'hits': hits},
  ];

  await File('flagged-comments.json').writeAsString(const JsonEncoder.withIndent('  ').convert(report));
}
```
