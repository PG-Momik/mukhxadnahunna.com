<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vitepress";
import { PORTS, portForPath, switchTo } from "../languages";

/* The language switcher at the top of the docs sidebar. It shows the language of the docs you're in. */

const route = useRoute();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

const inPort = computed(() => portForPath(route.path));
const current = computed(() => inPort.value ?? PORTS[0]);

function onPointerDown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div ref="root" class="lang-switch">
    <button
      type="button"
      class="lang-switch-button"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="`Language: ${current.name}`"
      @click="open = !open"
    >
      <span>{{ current.name }}</span>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
    </button>
    <ul v-show="open" class="lang-switch-menu" role="menu">
      <li v-for="p in PORTS" :key="p.id" role="none">
        <a
          role="menuitem"
          :href="switchTo(p, route.path)"
          :class="{ 'is-current': inPort?.id === p.id }"
          :aria-current="inPort?.id === p.id ? 'page' : undefined"
          @click="open = false"
        >
          <span>{{ p.name }}</span>
          <span v-if="!p.released" class="soon">Soon</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lang-switch {
  position: relative;
  padding: 20px 0 4px;
}
.lang-switch-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: border-color 0.2s ease;
}
.lang-switch-button:hover,
.lang-switch-button[aria-expanded="true"] {
  border-color: var(--vp-c-brand-1);
}
.lang-switch-button svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lang-switch-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}
.lang-switch-menu a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.lang-switch-menu a:hover {
  background: var(--vp-c-default-soft);
}
.lang-switch-menu a.is-current {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.soon {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 980px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
</style>
