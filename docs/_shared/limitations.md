This is a first-pass filter, not a moderator. It matches words from a list. It can't judge context, sarcasm or
meaning.

## By design

- **Short words match exactly.** `as`, `class`, `assignment` and `Assam` are never flagged.
- **Names win over coverage.** A stem that starts a name, like `shit` in *Shitij*, only works because the name is on
  the allow list. A name that starts with a stem and isn't on the list can be flagged. Add it with the allow-words
  option. See [Options](./api.md#options).
- **Risky entries are opt-in.** Words that are also ordinary words, like `damn` and `prick`, and stems that start
  many ordinary words, like `rand` and `cond`, only run at the strict level.
- **No everyday words, caste names, surnames or context-only insults.** A word list can't tell a slur from someone's
  name, or an insult from a description.
- **Censoring masks whole words.** A match is masked from its first character to its last, including a glued-on
  postposition (`mujiko` → `******`) and the dots in a spelled-out word (`F.U.C.K` → `*******`).
- **No semantic understanding.** A phrase like "you are a disgrace", written without any listed word, isn't caught.
- **Mixed scripts inside one word aren't handled.** A word that switches between Latin and Devanagari letters won't
  match either list.
- **A `*` on both ends of a word is read as markdown emphasis**, so `*is*` stays clean but `*ss*` isn't caught. A `*`
  on one end only is also tried as a hidden letter, so `*ss` is caught, and so is a lone `*and` (`gand`).

## Strict mode

At the strict level, ordinary words like `damn`, `prick` and `hoe`, and words that start with `rand`, `cond`, `kand` or
`lund`, are flagged. The common names and words among them, like `Randip`, `random`, `conditions`, `conductor`,
`Kandel` and `Lundberg`, are on the allow list and stay clean.

If you hit a false positive, please open an issue with the exact input.
