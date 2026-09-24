# Installation

::: warning Pre-release
`no-nepali-profanity` isn't published to npm yet. The commands below will work once the first version is released.
:::

## Install the package

::: code-group

```sh [npm]
npm install no-nepali-profanity
```

```sh [pnpm]
pnpm add no-nepali-profanity
```

```sh [yarn]
yarn add no-nepali-profanity
```

```sh [bun]
bun add no-nepali-profanity
```

:::

## Requirements

- **Node.js 18 or later**, or any runtime with ES2022 support, including Bun and Deno.
- **ES modules.** The package is ESM-only and doesn't ship a CommonJS build.

The package has no runtime dependencies.

## Import it

In an ES module or TypeScript project, import it directly:

```js
import { containsProfanity, findProfanity } from "no-nepali-profanity";
```

In a CommonJS file (one that uses `require`), use a dynamic `import()`:

```js
const { containsProfanity } = await import("no-nepali-profanity");
```

## TypeScript

Type definitions ship with the package, so you don't need an `@types` package. The option types are exported too:

```ts
import { createFilter, type FilterOptions } from "no-nepali-profanity";

const options: FilterOptions = { languages: ["romanized", "devanagari"], strictness: "standard" };
const filter = createFilter(options);
```

With `"moduleResolution": "node16"`, `"nodenext"` or `"bundler"` in your `tsconfig.json`, the types resolve
automatically.

## Browser use

The package uses no Node.js APIs, so bundlers like Vite, webpack and esbuild can include it in a browser build.

Checks in the browser are easy to bypass, though. Use them to warn users as they type, and always check again on the
server before saving anything.
