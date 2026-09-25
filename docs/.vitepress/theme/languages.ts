/*
 * The language ports, in one place. The landing page (tabs, rolling install command, buttons, ports section) and
 * the language switcher in the nav bar all read from here.
 *
 * When a port is released: set `released: true`, give it a `repo`, and put its docs under `docs` with the same page
 * names as /js/ (usage, api…), so the switcher can keep readers on the same page when they change language.
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

// The Composer vendor and the Go module path are placeholders until those repos exist.
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
    released: false,
  },
  {
    id: "go",
    label: "Go",
    name: "Go",
    install: "go get github.com/PG-Momik/no-nepali-profanity-go",
    registry: "Go modules",
    docs: "/go/",
    released: false,
  },
  {
    id: "php",
    label: "PHP",
    name: "PHP & Laravel",
    install: "composer require pg-momik/no-nepali-profanity",
    registry: "Packagist",
    docs: "/php/",
    released: false,
  },
  {
    id: "flutter",
    label: "Flutter",
    name: "Flutter & Dart",
    install: "flutter pub add no_nepali_profanity",
    registry: "pub.dev",
    docs: "/flutter/",
    released: false,
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
