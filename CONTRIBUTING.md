# Contributing

This is the documentation site for the `no-nepali-profanity` packages, at
[mukhxadnahunna.com](https://mukhxadnahunna.com). Fixes to wording, examples and typos are welcome. Every page has an
"Edit this page on GitHub" link at the bottom.

To report a problem with the packages themselves, or suggest a word, use the shared issue tracker:
[github.com/PG-Momik/no-nepali-profanity/issues](https://github.com/PG-Momik/no-nepali-profanity/issues).

## Development setup

```sh
git clone https://github.com/PG-Momik/mukhxadnahunna.com.git
cd mukhxadnahunna.com
npm install
npm run docs:dev      # dev server with hot reload
npm run docs:build    # production build, which also fails on dead links
```

## How the docs are organized

- Every port has the same pages under `docs/<port>/`, listed in `DOC_PAGES` in `docs/.vitepress/theme/languages.ts`.
  Add or rename a page in every port at once, so the language switcher keeps readers on the same page.
- Text that's the same for every language lives in `docs/_shared/` and is included with
  `<!--@include: ../_shared/…-->`. Change it there, not in a port's copy.
- Code examples are written per port, in that port's syntax. Each example's `// result` comment must be what the code
  really returns, so run it against the package before you change one.

See [README.md](README.md) for the landing page and the hero video.

## Pull requests

- Keep each pull request to one change, and explain why it's needed.
- Run `npm run docs:build` before you open it.

By contributing, you agree that your contribution is released under the [MIT License](LICENSE).
