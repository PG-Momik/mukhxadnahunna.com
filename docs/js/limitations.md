# Limitations

This is a first-pass filter, not a moderator. It matches words from a list. It can't judge context, sarcasm or
meaning.

## By design

- **Short words match exactly.** `as`, `class`, `assignment` and `Assam` are never flagged.
- **Names win over coverage.** Words that are also names or the start of names, like `shit` in *Shitij*, are only
  matched as whole words. Some dodged spellings get through as a result.
- **Risky stems are opt-in.** Stems that hit ordinary words, like `rand` → *Randip* and `cond` → *conditions*, only
  run at `strictness: "strict"`. See [Options](./api.md#strictness).
- **No everyday words, caste names, surnames or context-only insults.** A word list can't tell a slur from someone's
  name, or an insult from a description.
- **Censoring masks whole words.** A match is masked from its first character to its last, including a glued-on
  postposition (`mujiko` → `******`) and the dots in a spelled-out word (`F.U.C.K` → `*******`).
- **No semantic understanding.** A phrase like "you are a disgrace", written without any listed word, isn't caught.
- **Mixed scripts inside one word aren't handled.** A word that switches between Latin and Devanagari letters won't
  match either list.

## Known issues

These are real gaps in the current version.

| Input | Result | Expected | Cause |
|---|---|---|---|
| `that *ss` | `[]` | `["*ss"]` | A leading `*` is removed as markdown emphasis before the wildcard check. |
| `थुक्क` | `[]` | caught | Only `थुक` is listed. |

At `strictness: "strict"`, `Randip`, `conditions`, `conductor`, `kanda`, `Kandel` and `Lundberg` are flagged. That's
expected at that level.

If you hit a false positive, please open an issue with the exact input.
