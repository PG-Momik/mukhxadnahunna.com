<script setup lang="ts">
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";
import { PORTS, portForPath } from "../languages";

/* A top-nav link to a doc page in the port you're reading, or in the JavaScript docs elsewhere. */

const props = defineProps<{
  text: string;
  /** The page, relative to the port's docs: "" for the introduction, or "api", "examples"… */
  page: string;
  /** For the introduction link: pages that shouldn't count as being in it. */
  exclude?: string[];
  screenMenu?: boolean;
}>();

const route = useRoute();
const port = computed(() => portForPath(route.path) ?? PORTS[0]);
const href = computed(() => withBase(port.value.docs + props.page));
const active = computed(() => {
  const inPort = portForPath(route.path);
  if (!inPort) return false;
  const page = route.path.slice(inPort.docs.length).replace(/\.html$/, "");
  if (props.page === "") return !(props.exclude ?? []).some((p) => page.startsWith(p));
  return page.startsWith(props.page);
});
</script>

<template>
  <a :href="href" class="port-nav-link" :class="{ active, screen: screenMenu }">{{ text }}</a>
</template>

<style scoped>
.port-nav-link {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.25s;
}
.port-nav-link:hover,
.port-nav-link.active {
  color: var(--vp-c-brand-1);
}
.port-nav-link.screen {
  display: block;
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}
</style>
