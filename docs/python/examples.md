# Examples

## Validate a display name

Reject a sign-up or profile update if the name contains profanity:

```py
from no_nepali_profanity import find_profanity

def validate_display_name(name: str) -> dict:
    if find_profanity(name):
        return {"ok": False, "error": "Please choose a different name."}
    return {"ok": True}

validate_display_name("Shitij Adhikari")   # {"ok": True}
validate_display_name("muji123")           # {"ok": False, "error": "Please choose a different name."}
```

Don't show the matched words back to the user. That tells them exactly which spelling to try next.

## Check and censor in one pass

`check` scans a comment once. Read the result to decide what to do, then chain `.censor()` to get the masked text
without scanning again:

```py
import logging
from no_nepali_profanity import check

def save_comment(body: str):
    result = check(body)

    if result.has_profanity:
        logging.warning("Censored comment: %s", result.words)

    return Comment.objects.create(
        body=result.censor(),         # "you ****" for "you muji"
        original=body,                # keep the original for moderators, if your policy allows
        flagged=result.has_profanity,
    )
```

For a one-off, chain it directly:

```py
check("you muji").censor()                                  # "you ****"
check("you muji").censor({"mask": "#"})                     # "you ####"
check("fuck muji", {"languages": ["romanized"]}).censor()   # "fuck ****"
```

## Censor comments before display

Store what users write, and censor it when you show it. That way you can change the strictness later without
touching stored data:

```py
from no_nepali_profanity import create_filter

profanity_filter = create_filter({"strictness": "standard"})

def display_comment(comment: dict) -> dict:
    return {**comment, "body": profanity_filter.censor(comment["body"])}

display_comment({"id": 1, "body": "yo exam muji jasto thiyo"})
# {"id": 1, "body": "yo exam **** ***** thiyo"}
```

In a Jinja2 template (Flask or FastAPI), register it as a filter:

```py
app.jinja_env.filters["censor"] = profanity_filter.censor
```

```jinja
<p>{{ comment.body | censor }}</p>
```

## Reject profanity in a Django form

A validator for any form or model field:

```py
from django import forms
from django.core.exceptions import ValidationError
from no_nepali_profanity import contains_profanity

def no_profanity(value: str) -> None:
    if contains_profanity(value):
        raise ValidationError("This contains language that isn't allowed.")

class ReviewForm(forms.Form):
    title = forms.CharField(validators=[no_profanity])
    body = forms.CharField(widget=forms.Textarea, validators=[no_profanity])
```

## Reject profanity in FastAPI

The same check as a Pydantic validator, so bad input gets a 422 before your handler runs:

```py
from fastapi import FastAPI
from pydantic import BaseModel, field_validator
from no_nepali_profanity import contains_profanity

class Review(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def no_profanity(cls, value: str) -> str:
        if contains_profanity(value):
            raise ValueError("Your review contains language that isn't allowed.")
        return value

app = FastAPI()

@app.post("/reviews", status_code=201)
def create_review(review: Review):
    ...  # save the review
```

## Censor instead of rejecting

A Flask route that censors fields in place, so the post goes through with profanity masked:

```py
from flask import Flask, request
from no_nepali_profanity import create_filter

app = Flask(__name__)
profanity_filter = create_filter()

@app.post("/comments")
def create_comment():
    data = request.get_json()
    for field in ("title", "body"):
        if isinstance(data.get(field), str):
            data[field] = profanity_filter.censor(data[field])
    # data["body"] is now censored; save it…
    return "", 201
```

## Highlight matches for moderators

Wrap each match instead of hiding it. Escape the text for HTML first, then highlight using the positions from
`find_profanity_matches`:

```py
from html import escape
from no_nepali_profanity import find_profanity_matches

def highlight(text: str) -> str:
    html = ""
    last = 0
    for m in find_profanity_matches(text):
        if m.start < last:   # skip a word inside a phrase that is already highlighted
            continue
        html += escape(text[last:m.start]) + f"<mark>{escape(m.text)}</mark>"
        last = m.end
    return html + escape(text[last:])

highlight("you muji <3")   # "you <mark>muji</mark> &lt;3"
```

## Block severe words, review the rest

Use two filters to split incoming text three ways:

- Text with severe profanity is rejected automatically.
- Text that only the stricter filter flags goes to a moderator.
- Everything else is published.

This way, false positives from `"strict"`, like the name *Randip*, reach a person instead of being blocked.

```py
from no_nepali_profanity import create_filter

block = create_filter({"strictness": "lenient"})
review = create_filter({"strictness": "strict"})

def moderate(text: str) -> dict:
    if block.contains_profanity(text):
        return {"action": "reject"}
    hits = review.find_profanity(text)
    if hits:
        return {"action": "review", "hits": hits}
    return {"action": "publish"}

moderate("muji")             # {"action": "reject"}
moderate("you idiot")        # {"action": "review", "hits": ["idiot"]}
moderate("Randip Thapa")     # {"action": "review", "hits": ["randip"]}
moderate("Great teacher!")   # {"action": "publish"}
```

## Nepali only

If your community allows English swearing but not Nepali abuse, turn English off:

```py
from no_nepali_profanity import create_filter

nepali = create_filter({"languages": ["romanized", "devanagari"]})

nepali.contains_profanity("this exam was shit")   # False
nepali.contains_profanity("yo exam muji jasto")   # True
nepali.contains_profanity("मुजी जस्तो")            # True
```

## Scan existing content

Check content that was saved before you added the filter, and write out what matched for review:

```py
import json
from no_nepali_profanity import create_filter

profanity_filter = create_filter({"strictness": "strict"})

# `comments` comes from your database: [{"id": …, "body": …}, …]
report = [
    {"id": c["id"], "hits": hits}
    for c in comments
    if (hits := profanity_filter.find_profanity(c["body"]))
]

with open("flagged-comments.json", "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
```
