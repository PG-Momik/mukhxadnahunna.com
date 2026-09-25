import { defineConfig } from "vitepress";
import { DOC_PAGES, PORTS, SITE_REPO } from "./theme/languages";


export default defineConfig({
  title: "mukh-xadna-hunna",
  description: "Profanity filtering for Nepali text: English, Romanized Nepali and Devanagari.",
  lang: "en-US",
  // Dark by default; visitors can still switch to light with the toggle, and their choice is remembered.
  appearance: "dark",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: "https://mukhxadnahunna.com" },
  // Sections every port's docs pull in with <!--@include: ../_shared/…-->; not pages of their own.
  srcExclude: ["_shared/**"],

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
    // Link previews on LinkedIn, Slack, X and others. og:image must be an absolute URL.
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "mukh-xadna-hunna" }],
    ["meta", { property: "og:url", content: "https://mukhxadnahunna.com/" }],
    ["meta", { property: "og:title", content: "Nepali profanity filter to keep it civil." }],
    [
      "meta",
      {
        property: "og:description",
        content: "Detect and censor abuse in English, Romanized Nepali and Devanagari. For JS, Python, Go, PHP and Flutter.",
      },
    ],
    ["meta", { property: "og:image", content: "https://mukhxadnahunna.com/og.png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "627" }],
    ["meta", { property: "og:image:alt", content: "Nepali profanity filter to keep it civil." }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],

  themeConfig: {
    // Each link goes to the page in the port you're reading, or in the JavaScript docs elsewhere.
    nav: [
      { component: "PortNavLink", props: { text: "Docs", page: "", exclude: ["examples", "api", "changelog"] } },
      { component: "PortNavLink", props: { text: "Examples", page: "examples" } },
      { component: "PortNavLink", props: { text: "API", page: "api" } },
      { component: "PortNavLink", props: { text: "Changelog", page: "changelog" } },
    ],

    sidebar: Object.fromEntries(
      PORTS.map((p) => [
        p.docs,
        p.released
          ? DOC_PAGES.map((g) => ({ ...g, items: g.items.map((item) => ({ ...item, link: p.docs + item.link })) }))
          : // Unreleased ports: a one-page sidebar, so the language switcher is there to get back.
            [{ text: p.name, items: [{ text: "Coming soon", link: p.docs }] }],
      ])
    ),

    // No socialLinks: the GitHub icon is theme/components/NavGitHub.vue, which links to the page's port.

    editLink: {
      pattern: `${SITE_REPO}/edit/main/docs/:path`,
      text: "Edit this page on GitHub",
    },

    search: { provider: "local" },

    // Three items spread across the row; see .VPFooter .message in theme/style.css.
    footer: {
      message:
        '<span>Built with purpose</span><a href="https://momik.dev" target="_blank" rel="noopener">Momik Shrestha</a><span>Released under the MIT License</span>',
    },
  },
});
