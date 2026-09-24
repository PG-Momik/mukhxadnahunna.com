# Examples

## Validate a display name

Reject a sign-up or profile update if the name contains profanity:

```js
import { findProfanity } from "no-nepali-profanity";

export function validateDisplayName(name) {
  const hits = findProfanity(name);
  if (hits.length > 0) {
    return { ok: false, error: "Please choose a different name." };
  }
  return { ok: true };
}

validateDisplayName("Shitij Adhikari");   // { ok: true }
validateDisplayName("muji123");           // { ok: false, error: "Please choose a different name." }
```

Don't show the matched words back to the user. That tells them exactly which spelling to try next.

## Check and censor in one pass

`check` scans a comment once. Read the result to decide what to do, then chain `.censor()` to get the masked text
without scanning again:

```js
import { check } from "no-nepali-profanity";

export async function saveComment(body) {
  const result = check(body);

  if (result.hasProfanity) {
    console.warn("Censored comment", { words: result.words });
  }

  return db.comments.insert({
    body: result.censor(),            // "you ****" for "you muji"
    original: body,                   // keep the original for moderators, if your policy allows
    flagged: result.hasProfanity,
  });
}
```

For a one-off, chain it directly:

```js
check("you muji").censor();                       // "you ****"
check("you muji").censor({ mask: "#" });          // "you ####"
check("fuck muji", { languages: ["romanized"] }).censor();   // "fuck ****"
```

## Censor comments before display

Store what users write, and censor it when you show it. That way you can change the strictness later without
touching stored data:

```js
import { createFilter } from "no-nepali-profanity";

const filter = createFilter({ strictness: "standard" });

function displayComment(comment) {
  return { ...comment, body: filter.censor(comment.body) };
}

displayComment({ id: 1, body: "yo exam muji jasto thiyo" });
// { id: 1, body: "yo exam **** ***** thiyo" }
```

## Censor instead of rejecting

An Express middleware that censors fields in place, so the post goes through with profanity masked:

```js
import express from "express";
import { createFilter } from "no-nepali-profanity";

const filter = createFilter();

function censorFields(...fields) {
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === "string") {
        req.body[field] = filter.censor(value);
      }
    }
    next();
  };
}

const app = express();
app.use(express.json());

app.post("/comments", censorFields("title", "body"), (req, res) => {
  // req.body.body is already censored
  res.status(201).end();
});
```

## Highlight matches for moderators

Wrap each match instead of hiding it. Escape the text for HTML first, then highlight using the positions from
`findProfanityMatches`:

```js
import { findProfanityMatches } from "no-nepali-profanity";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function highlight(text) {
  let html = "";
  let last = 0;
  for (const m of findProfanityMatches(text)) {
    if (m.start < last) continue;   // skip a word inside a phrase that is already highlighted
    html += escapeHtml(text.slice(last, m.start)) + `<mark>${escapeHtml(m.text)}</mark>`;
    last = m.end;
  }
  return html + escapeHtml(text.slice(last));
}

highlight("you muji <3");   // "you <mark>muji</mark> &lt;3"
```

## Reject profanity in Express

Reject requests whose body contains profanity in selected fields:

```js
import express from "express";
import { createFilter } from "no-nepali-profanity";

const filter = createFilter();

function rejectProfanity(...fields) {
  return (req, res, next) => {
    const flagged = fields.filter((field) => {
      const value = req.body?.[field];
      return typeof value === "string" && filter.containsProfanity(value);
    });

    if (flagged.length > 0) {
      return res.status(422).json({ error: "Your post contains language that isn't allowed.", fields: flagged });
    }
    next();
  };
}

const app = express();
app.use(express.json());

app.post("/comments", rejectProfanity("title", "body"), (req, res) => {
  // save the comment…
  res.status(201).end();
});
```

## Next.js route handler

The same check in an App Router route handler:

```ts
// app/api/reviews/route.ts
import { containsProfanity } from "no-nepali-profanity";

export async function POST(request: Request) {
  const { body } = await request.json();

  if (typeof body !== "string" || containsProfanity(body)) {
    return Response.json({ error: "Your review contains language that isn't allowed." }, { status: 422 });
  }

  // save the review…
  return Response.json({ ok: true }, { status: 201 });
}
```

## Block severe words, review the rest

Use two filters to split incoming text three ways:

- Text with severe profanity is rejected automatically.
- Text that only the stricter filter flags goes to a moderator.
- Everything else is published.

This way, false positives from `"strict"`, like the name *Randip*, reach a person instead of being blocked.

```js
import { createFilter } from "no-nepali-profanity";

const block = createFilter({ strictness: "lenient" });
const review = createFilter({ strictness: "strict" });

export function moderate(text) {
  if (block.containsProfanity(text)) {
    return { action: "reject" };
  }
  const hits = review.findProfanity(text);
  if (hits.length > 0) {
    return { action: "review", hits };
  }
  return { action: "publish" };
}

moderate("muji");                   // { action: "reject" }
moderate("you idiot");              // { action: "review", hits: ["idiot"] }
moderate("Randip Thapa");           // { action: "review", hits: ["randip"] }
moderate("Great teacher!");         // { action: "publish" }
```

## Nepali only

If your community allows English swearing but not Nepali abuse, turn English off:

```js
import { createFilter } from "no-nepali-profanity";

const nepali = createFilter({ languages: ["romanized", "devanagari"] });

nepali.containsProfanity("this exam was shit");   // false
nepali.containsProfanity("yo exam muji jasto");   // true
nepali.containsProfanity("मुजी जस्तो");            // true
```

## Warn while typing

In a browser form, warn the user before they submit. The server still has to check again, because a browser check
is easy to bypass.

```js
import { containsProfanity } from "no-nepali-profanity";

const textarea = document.querySelector("#comment");
const warning = document.querySelector("#comment-warning");

textarea.addEventListener("input", () => {
  warning.hidden = !containsProfanity(textarea.value);
});
```

## Scan existing content

Check content that was saved before you added the filter, and write out what matched for review:

```js
import { writeFileSync } from "node:fs";
import { createFilter } from "no-nepali-profanity";

const filter = createFilter({ strictness: "strict" });

// `comments` comes from your database: [{ id, body }, …]
const report = comments
  .map(({ id, body }) => ({ id, hits: filter.findProfanity(body) }))
  .filter(({ hits }) => hits.length > 0);

writeFileSync("flagged-comments.json", JSON.stringify(report, null, 2));
```
