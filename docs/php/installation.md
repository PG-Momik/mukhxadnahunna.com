# Installation

::: warning Pre-release
`pg-momik/no-nepali-profanity` isn't published to Packagist yet. The command below will work once the first version
is released.
:::

## Install the package

```sh
composer require pg-momik/no-nepali-profanity
```

## Requirements

- **PHP 8.2 or later.**
- The **`intl`** extension, for Unicode normalization, and **`mbstring`**. Both are enabled in most PHP builds; run
  `php -m` to check.

The package has no other dependencies.

## Import it

Everything is in the `NoNepaliProfanity` namespace, and Composer's autoloader loads it:

```php
require __DIR__ . '/vendor/autoload.php';

use NoNepaliProfanity\Profanity;

Profanity::containsProfanity('muji');   // true
```

`Profanity` has a static method for each function. For fixed options, `Profanity::createFilter()` returns a
`ProfanityFilter` object with the same methods; see [Reuse a filter](./usage.md#reuse-a-filter).
