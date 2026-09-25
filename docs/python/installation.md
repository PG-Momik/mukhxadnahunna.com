# Installation

::: warning Pre-release
`no-nepali-profanity` isn't published to PyPI yet. The commands below will work once the first version is released.
:::

## Install the package

::: code-group

```sh [pip]
pip install no-nepali-profanity
```

```sh [uv]
uv add no-nepali-profanity
```

```sh [poetry]
poetry add no-nepali-profanity
```

:::

## Requirements

- **Python 3.9 or later.**

The package has no dependencies outside the standard library.

## Import it

The distribution is called `no-nepali-profanity`; the module is `no_nepali_profanity`:

```py
from no_nepali_profanity import contains_profanity, find_profanity
```

## Type hints

The package ships a `py.typed` marker, so mypy and Pyright check your calls against its type hints. Options are a
plain `dict`:

```py
from no_nepali_profanity import create_filter

options = {"languages": ["romanized", "devanagari"], "strictness": "standard"}
profanity_filter = create_filter(options)
```
