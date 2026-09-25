<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";
import { repoForPath } from "../languages";

/* A link into the GitHub repository for the page you're on: the port's own in its docs, this site's elsewhere.
   Used in shared doc sections as <RepoLink path="/issues">GitHub</RepoLink>. */

const props = defineProps<{ path?: string }>();
const route = useRoute();
const href = computed(() => repoForPath(route.path) + (props.path ?? ""));
</script>

<template>
  <a :href="href" target="_blank" rel="noopener"><slot /></a>
</template>
