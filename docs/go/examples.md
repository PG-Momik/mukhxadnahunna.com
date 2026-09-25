# Examples

## Validate a display name

Reject a sign-up or profile update if the name contains profanity:

```go
var errDisplayName = errors.New("please choose a different name")

func validateDisplayName(name string) error {
	if nepaliprofanity.ContainsProfanity(name) {
		return errDisplayName
	}
	return nil
}
```

```go
validateDisplayName("Shitij Adhikari")   // nil
validateDisplayName("muji123")           // errDisplayName
```

Don't show the matched words back to the user. That tells them exactly which spelling to try next.

## Check and censor in one pass

`Check` scans a comment once. Read the result to decide what to do, then call `Censor()` to get the masked text
without scanning again:

```go
func saveComment(ctx context.Context, db *sql.DB, body string) error {
	result := nepaliprofanity.Check(body)

	if result.HasProfanity {
		slog.Warn("censored comment", "words", result.Words)
	}

	_, err := db.ExecContext(ctx,
		"INSERT INTO comments (body, original, flagged) VALUES ($1, $2, $3)",
		result.Censor(), // "you ****" for "you muji"
		body,            // keep the original for moderators, if your policy allows
		result.HasProfanity,
	)
	return err
}
```

For a one-off, chain it directly:

```go
nepaliprofanity.Check("you muji").Censor()                                             // "you ****"
nepaliprofanity.Check("you muji").Censor(nepaliprofanity.CensorOptions{Mask: "#"})   // "you ####"
```

## Censor comments before display

Store what users write, and censor it when you show it. That way you can change the strictness later without
touching stored data. With `html/template`, add it as a template function:

```go
var tmpl = template.Must(template.New("comment").
	Funcs(template.FuncMap{"censor": func(s string) string { return nepaliprofanity.Censor(s) }}).
	Parse(`<p>{{ censor .Body }}</p>`))
```

`html/template` escapes the censored text as usual.

## Reject profanity in an HTTP handler

Reject requests whose body contains profanity in selected fields:

```go
type commentRequest struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

func createComment(w http.ResponseWriter, r *http.Request) {
	var req commentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	var flagged []string
	if nepaliprofanity.ContainsProfanity(req.Title) {
		flagged = append(flagged, "title")
	}
	if nepaliprofanity.ContainsProfanity(req.Body) {
		flagged = append(flagged, "body")
	}
	if len(flagged) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]any{
			"error":  "Your post contains language that isn't allowed.",
			"fields": flagged,
		})
		return
	}

	// save the comment…
	w.WriteHeader(http.StatusCreated)
}
```

## Censor instead of rejecting

Censor the fields in place, so the post goes through with profanity masked:

```go
func createCensoredComment(w http.ResponseWriter, r *http.Request) {
	var req commentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	req.Title = nepaliprofanity.Censor(req.Title)
	req.Body = nepaliprofanity.Censor(req.Body)

	// req.Body is now censored; save it…
	w.WriteHeader(http.StatusCreated)
}
```

## Highlight matches for moderators

Wrap each match instead of hiding it. Escape the text for HTML first, then highlight using the positions from
`FindProfanityMatches`:

```go
func highlight(text string) string {
	var b strings.Builder
	last := 0
	for _, m := range nepaliprofanity.FindProfanityMatches(text) {
		if m.Start < last {
			continue // skip a word inside a phrase that is already highlighted
		}
		b.WriteString(html.EscapeString(text[last:m.Start]))
		b.WriteString("<mark>" + html.EscapeString(m.Text) + "</mark>")
		last = m.End
	}
	b.WriteString(html.EscapeString(text[last:]))
	return b.String()
}
```

```go
highlight("you muji <3")   // "you <mark>muji</mark> &lt;3"
```

## Block severe words, review the rest

Use two filters to split incoming text three ways:

- Text with severe profanity is rejected automatically.
- Text that only the stricter filter flags goes to a moderator.
- Everything else is published.

This way, false positives from `Strict`, like the name *Randip*, reach a person instead of being blocked.

```go
var (
	block  = nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Lenient})
	review = nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Strict})
)

type decision struct {
	Action string
	Hits   []string
}

func moderate(text string) decision {
	if block.ContainsProfanity(text) {
		return decision{Action: "reject"}
	}
	if hits := review.FindProfanity(text); len(hits) > 0 {
		return decision{Action: "review", Hits: hits}
	}
	return decision{Action: "publish"}
}
```

```go
moderate("muji")             // decision{Action: "reject"}
moderate("you idiot")        // decision{Action: "review", Hits: []string{"idiot"}}
moderate("Randip Thapa")     // decision{Action: "review", Hits: []string{"randip"}}
moderate("Great teacher!")   // decision{Action: "publish"}
```

## Nepali only

If your community allows English swearing but not Nepali abuse, turn English off:

```go
nepali := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{
	Languages: []nepaliprofanity.Language{nepaliprofanity.Romanized, nepaliprofanity.Devanagari},
})

nepali.ContainsProfanity("this exam was shit")   // false
nepali.ContainsProfanity("yo exam muji jasto")   // true
nepali.ContainsProfanity("मुजी जस्तो")            // true
```

## Scan existing content

Check content that was saved before you added the filter, and write out what matched for review:

```go
type flagged struct {
	ID   int64    `json:"id"`
	Hits []string `json:"hits"`
}

func scanComments(ctx context.Context, db *sql.DB) error {
	strict := nepaliprofanity.MustNewFilter(nepaliprofanity.FilterOptions{Strictness: nepaliprofanity.Strict})

	rows, err := db.QueryContext(ctx, "SELECT id, body FROM comments")
	if err != nil {
		return err
	}
	defer rows.Close()

	var report []flagged
	for rows.Next() {
		var id int64
		var body string
		if err := rows.Scan(&id, &body); err != nil {
			return err
		}
		if hits := strict.FindProfanity(body); len(hits) > 0 {
			report = append(report, flagged{ID: id, Hits: hits})
		}
	}
	if err := rows.Err(); err != nil {
		return err
	}

	out, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("flagged-comments.json", out, 0o644)
}
```
