import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Landing from "./components/Landing.vue";
import LangSwitcher from "./components/LangSwitcher.vue";
import PortNavLink from "./components/PortNavLink.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  // The language switcher sits at the top of the docs sidebar.
  Layout: () => h(DefaultTheme.Layout, null, { "sidebar-nav-before": () => h(LangSwitcher) }),
  enhanceApp({ app }) {
    app.component("Landing", Landing);
    app.component("PortNavLink", PortNavLink);
  },
} satisfies Theme;
