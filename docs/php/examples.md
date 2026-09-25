# Examples

## Validate a display name

Reject a sign-up or profile update if the name contains profanity:

```php
use NoNepaliProfanity\Profanity;

function validateDisplayName(string $name): array
{
    if (Profanity::findProfanity($name) !== []) {
        return ['ok' => false, 'error' => 'Please choose a different name.'];
    }
    return ['ok' => true];
}
```

```php
validateDisplayName('Shitij Adhikari');   // ['ok' => true]
validateDisplayName('muji123');           // ['ok' => false, 'error' => 'Please choose a different name.']
```

Don't show the matched words back to the user. That tells them exactly which spelling to try next.

## Check and censor in one pass

`check` scans a comment once. Read the result to decide what to do, then chain `->censor()` to get the masked text
without scanning again:

```php
use NoNepaliProfanity\Profanity;

function saveComment(PDO $pdo, string $body): void
{
    $result = Profanity::check($body);

    if ($result->hasProfanity) {
        error_log('Censored comment: ' . implode(', ', $result->words));
    }

    $insert = $pdo->prepare('INSERT INTO comments (body, original, flagged) VALUES (?, ?, ?)');
    $insert->execute([
        $result->censor(),          // 'you ****' for 'you muji'
        $body,                      // keep the original for moderators, if your policy allows
        (int) $result->hasProfanity,
    ]);
}
```

For a one-off, chain it directly:

```php
Profanity::check('you muji')->censor();                                   // 'you ****'
Profanity::check('you muji')->censor(['mask' => '#']);                    // 'you ####'
Profanity::check('fuck muji', ['languages' => ['romanized']])->censor();  // 'fuck ****'
```

## Censor comments before display

Store what users write, and censor it when you show it. That way you can change the strictness later without
touching stored data. Escape the censored text as you would any other user input:

```php
use NoNepaliProfanity\Profanity;

$filter = Profanity::createFilter(['strictness' => 'standard']);

foreach ($comments as $comment) {
    echo '<p>' . htmlspecialchars($filter->censor($comment['body'])) . '</p>';
}
```

```php
Profanity::createFilter()->censor('yo exam muji jasto thiyo');   // 'yo exam **** ***** thiyo'
```

## Reject profanity in a form handler

Reject a submission whose fields contain profanity:

```php
use NoNepaliProfanity\Profanity;

$flagged = array_values(array_filter(
    ['title', 'body'],
    fn (string $field) => is_string($_POST[$field] ?? null) && Profanity::containsProfanity($_POST[$field]),
));

if ($flagged !== []) {
    http_response_code(422);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Your post contains language that isn't allowed.", 'fields' => $flagged]);
    exit;
}

// save the comment…
```

## Censor instead of rejecting

Censor the fields in place, so the post goes through with profanity masked:

```php
use NoNepaliProfanity\Profanity;

$filter = Profanity::createFilter();

foreach (['title', 'body'] as $field) {
    if (is_string($_POST[$field] ?? null)) {
        $_POST[$field] = $filter->censor($_POST[$field]);
    }
}

// $_POST['body'] is now censored; save it…
```

## Highlight matches for moderators

Wrap each match instead of hiding it. Escape the text for HTML first, then highlight using the positions from
`findProfanityMatches`. Positions count characters, so slice with `mb_substr`:

```php
use NoNepaliProfanity\Profanity;

function highlight(string $text): string
{
    $html = '';
    $last = 0;
    foreach (Profanity::findProfanityMatches($text) as $m) {
        if ($m->start < $last) {
            continue; // skip a word inside a phrase that is already highlighted
        }
        $html .= htmlspecialchars(mb_substr($text, $last, $m->start - $last)) . '<mark>' . htmlspecialchars($m->text) . '</mark>';
        $last = $m->end;
    }
    return $html . htmlspecialchars(mb_substr($text, $last));
}
```

```php
highlight('you muji <3');   // 'you <mark>muji</mark> &lt;3'
```

## Block severe words, review the rest

Use two filters to split incoming text three ways:

- Text with severe profanity is rejected automatically.
- Text that only the stricter filter flags goes to a moderator.
- Everything else is published.

This way, false positives from `'strict'`, like the name *Randip*, reach a person instead of being blocked.

```php
use NoNepaliProfanity\Profanity;

function moderate(string $text): array
{
    static $block = null, $review = null;
    $block ??= Profanity::createFilter(['strictness' => 'lenient']);
    $review ??= Profanity::createFilter(['strictness' => 'strict']);

    if ($block->containsProfanity($text)) {
        return ['action' => 'reject'];
    }
    $hits = $review->findProfanity($text);
    if ($hits !== []) {
        return ['action' => 'review', 'hits' => $hits];
    }
    return ['action' => 'publish'];
}
```

```php
moderate('muji');             // ['action' => 'reject']
moderate('you idiot');        // ['action' => 'review', 'hits' => ['idiot']]
moderate('Randip Thapa');     // ['action' => 'review', 'hits' => ['randip']]
moderate('Great teacher!');   // ['action' => 'publish']
```

## Nepali only

If your community allows English swearing but not Nepali abuse, turn English off:

```php
$nepali = Profanity::createFilter(['languages' => ['romanized', 'devanagari']]);

$nepali->containsProfanity('this exam was shit');   // false
$nepali->containsProfanity('yo exam muji jasto');   // true
$nepali->containsProfanity('मुजी जस्तो');            // true
```

## Scan existing content

Check content that was saved before you added the filter, and write out what matched for review:

```php
use NoNepaliProfanity\Profanity;

$filter = Profanity::createFilter(['strictness' => 'strict']);
$report = [];

foreach ($pdo->query('SELECT id, body FROM comments') as $row) {
    $hits = $filter->findProfanity($row['body']);
    if ($hits !== []) {
        $report[] = ['id' => $row['id'], 'hits' => $hits];
    }
}

file_put_contents('flagged-comments.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
```
