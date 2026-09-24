import { defineConfig } from "vitepress";

// Update these when the repositories are created or renamed.
const JS_REPO = "https://github.com/PG-Momik/no-nepali-profanity";
const SITE_REPO = "https://github.com/PG-Momik/mukhxadnahunna.com";

export default defineConfig({
  title: "mukhxadnahunna",
  description: "Profanity filtering for Nepali text: English, Romanized Nepali and Devanagari.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: "https://mukhxadnahunna.com" },

  head: [
    ["meta", { name: "theme-color", content: "#b91c1c" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "mukhxadnahunna" }],
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
      { text: "Home", link: "/" },
      {
        text: "Ports",
        items: [
          { text: "JavaScript / TypeScript", link: "/js/" },
          { text: "PHP / Laravel (planned)", link: "/#ports" },
          { text: "Python (planned)", link: "/#ports" },
          { text: "Go (planned)", link: "/#ports" },
        ],
      },
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
