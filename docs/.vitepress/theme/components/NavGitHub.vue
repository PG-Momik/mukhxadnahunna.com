<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";
import { portForPath, repoForPath } from "../languages";

/* The GitHub icon in the nav bar: the port's repository in its docs, this site's repository everywhere else. */

defineProps<{ screen?: boolean }>();
const route = useRoute();
const href = computed(() => repoForPath(route.path));
const label = computed(() => {
  const port = portForPath(route.path);
  return port ? `${port.name} package on GitHub` : "This site on GitHub";
});
</script>

<template>
  <div class="nav-github" :class="{ screen }">
    <a :href="href" target="_blank" rel="noopener" :aria-label="label" :title="label">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
    </a>
  </div>
</template>

<style scoped>
.nav-github {
  display: flex;
  align-items: center;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--vp-c-divider);
  height: 24px;
}
.nav-github.screen {
  justify-content: center;
  margin: 24px 0 0;
  padding: 0;
  border: 0;
}
.nav-github a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
.nav-github a:hover {
  color: var(--vp-c-text-1);
}
.nav-github svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
