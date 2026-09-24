import { defineConfig } from "vitepress";

// Update these when the repositories are created or renamed.
const JS_REPO = "https://github.com/PG-Momik/no-nepali-profanity";
const SITE_REPO = "https://github.com/PG-Momik/mukhxadnahunna.com";

export default defineConfig({
  title: "mukh-xadna-hunna",
  description: "Profanity filtering for Nepali text: English, Romanized Nepali and Devanagari.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: "https://mukhxadnahunna.com" },

  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap",
      },
    ],
    ["meta", { name: "theme-color", content: "#ffffff" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "mukh-xadna-hunna" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Profanity filtering for Nepali text: English, Romanized Nepali and Devanagari.",
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: "Docs", link: "/js/", activeMatch: "^/js/(?!api|examples|changelog)" },
      { text: "Examples", link: "/js/examples" },
      { text: "API", link: "/js/api" },
      { text: "Changelog", link: "/js/changelog" },
    ],

    sidebar: {
      "/js/": [
        {
          text: "Getting started",
          items: [
            { text: "Introduction", link: "/js/" },
            { text: "Installation", link: "/js/installation" },
            { text: "Usage", link: "/js/usage" },
            { text: "Censoring", link: "/js/censoring" },
            { text: "Examples", link: "/js/examples" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "API", link: "/js/api" },
            { text: "How matching works", link: "/js/how-it-works" },
            { text: "The lexicon", link: "/js/lexicon" },
          ],
        },
        {
          text: "More",
          items: [
            { text: "Limitations", link: "/js/limitations" },
            { text: "FAQ", link: "/js/faq" },
            { text: "Contributing", link: "/js/contributing" },
            { text: "Changelog", link: "/js/changelog" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: JS_REPO }],

    editLink: {
      pattern: `${SITE_REPO}/edit/main/docs/:path`,
      text: "Edit this page on GitHub",
    },

    search: { provider: "local" },

    footer: {
      message: "Released under the MIT License.",
      copyright: "© PG-Momik",
    },
  },
});
