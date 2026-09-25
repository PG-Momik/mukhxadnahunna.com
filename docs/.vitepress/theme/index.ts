import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Landing from "./components/Landing.vue";
import LangSwitcher from "./components/LangSwitcher.vue";
import NavGitHub from "./components/NavGitHub.vue";
import PortNavLink from "./components/PortNavLink.vue";
import RepoLink from "./components/RepoLink.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  // The language switcher sits at the top of the docs sidebar. The GitHub icon in the nav follows the page's port.
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "sidebar-nav-before": () => h(LangSwitcher),
      "nav-bar-content-after": () => h(NavGitHub),
      "nav-screen-content-after": () => h(NavGitHub, { screen: true }),
    }),
  enhanceApp({ app }) {
    app.component("Landing", Landing);
    app.component("PortNavLink", PortNavLink);
    app.component("RepoLink", RepoLink);
  },
} satisfies Theme;
