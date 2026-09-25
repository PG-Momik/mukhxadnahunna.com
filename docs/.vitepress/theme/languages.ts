/*
 * The language ports, in one place. The landing page (tabs, rolling install command, buttons, ports section) and
 * the language switcher in the nav bar all read from here.
 *
 * Every released port has the same doc pages as /js/ (usage, api…), so the switcher keeps readers on the same page
 * when they change language, and the sidebar in ../config.mts is built from DOC_PAGES for each of them.
 */

export const GITHUB = "https://github.com/PG-Momik/no-nepali-profanity";

export interface Port {
  id: string;
  /** Short label, for the landing page's tabs. */
  label: string;
  /** Full name, for the switcher and the ports section. */
  name: string;
  install: string;
  registry: string;
  /** The port's docs, or its "coming soon" page until it's released. Ends with a slash. */
  docs: string;
  repo?: string;
  released: boolean;
}

export const PORTS: Port[] = [
  {
    id: "js",
    label: "JS",
    name: "JavaScript",
    install: "npm install no-nepali-profanity",
    registry: "npm",
    docs: "/js/",
    repo: GITHUB,
    released: true,
  },
  {
    id: "python",
    label: "Python",
    name: "Python",
    install: "pip install no-nepali-profanity",
    registry: "PyPI",
    docs: "/python/",
    repo: "https://github.com/PG-Momik/no-nepali-profanity-python",
    released: true,
  },
  {
    id: "go",
    label: "Go",
    name: "Go",
    install: "go get github.com/PG-Momik/no-nepali-profanity-go",
    registry: "Go modules",
    docs: "/go/",
    repo: "https://github.com/PG-Momik/no-nepali-profanity-go",
    released: true,
  },
  {
    id: "php",
    label: "PHP",
    name: "PHP",
    install: "composer require pg-momik/no-nepali-profanity",
    registry: "Packagist",
    docs: "/php/",
    repo: "https://github.com/PG-Momik/no-nepali-profanity-php",
    released: true,
  },
  {
    id: "flutter",
    label: "Flutter",
    name: "Flutter & Dart",
    install: "flutter pub add no_nepali_profanity",
    registry: "pub.dev",
    docs: "/flutter/",
    repo: "https://github.com/PG-Momik/no-nepali-profanity-flutter",
    released: true,
  },
];

/** The doc pages every released port has, as sidebar groups. Links are relative to the port's `docs`. */
export const DOC_PAGES = [
  {
    text: "Getting started",
    items: [
      { text: "Introduction", link: "" },
      { text: "Installation", link: "installation" },
      { text: "Usage", link: "usage" },
      { text: "Censoring", link: "censoring" },
      { text: "Examples", link: "examples" },
    ],
  },
  {
    text: "Reference",
    items: [
      { text: "API", link: "api" },
      { text: "How matching works", link: "how-it-works" },
      { text: "The lexicon", link: "lexicon" },
    ],
  },
  {
    text: "More",
    items: [
      { text: "Limitations", link: "limitations" },
      { text: "FAQ", link: "faq" },
      { text: "Contributing", link: "contributing" },
      { text: "Changelog", link: "changelog" },
    ],
  },
];

/** The port whose docs the path is in, if any. */
export const portForPath = (path: string) => PORTS.find((p) => path.startsWith(p.docs));

/**
 * Where to go when switching to `to` from `path`. Between released ports it keeps the same page (/js/usage →
 * /python/usage); otherwise it goes to the port's own page.
 */
export function switchTo(to: Port, path: string): string {
  const from = portForPath(path);
  if (from && from.released && to.released) return to.docs + path.slice(from.docs.length);
  return to.docs;
}
