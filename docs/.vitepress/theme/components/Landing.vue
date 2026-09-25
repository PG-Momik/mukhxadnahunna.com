<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
// Imported rather than served from public/, so each build names them by content: a new recording gets a new URL,
// and browsers and caches can't keep serving an old one.
import blockedMp4 from "../media/comment-blocked.mp4";
import blockedWebm from "../media/comment-blocked.webm";
import blockedPoster from "../media/comment-blocked-poster.jpg";
import censoredMp4 from "../media/comment-censored.mp4";
import censoredWebm from "../media/comment-censored.webm";
import censoredPoster from "../media/comment-censored-poster.jpg";

import { check, type Strictness } from "no-nepali-profanity";
import { GITHUB, PORTS } from "../languages";

/*
 * Hero videos, recorded from the demo apps and encoded into ../media/ (see "Hero video" in the README). They play
 * one after the other on a loop; the tabs under the frame show which one is playing and switch between them.
 */
const HERO_VIDEOS = [
  {
    name: "comment-blocked",
    label: "Blocks it",
    caption: "Use it as form validation: reject abusive input before it's submitted.",
    mp4: blockedMp4,
    webm: blockedWebm,
    poster: blockedPoster,
  },
  {
    name: "comment-censored",
    label: "Censors it",
    caption: "Or censor on the client: mask the abuse and let the post through.",
    mp4: censoredMp4,
    webm: censoredWebm,
    poster: censoredPoster,
  },
];

const activeVideo = ref(0);
const videoProgress = ref(0);
const videoEls: HTMLVideoElement[] = [];
let reducedMotion = false;
let progressFrame = 0;

function setVideoEl(el: unknown, i: number) {
  if (el instanceof HTMLVideoElement) videoEls[i] = el;
}

function showVideo(i: number) {
  activeVideo.value = i;
  videoProgress.value = 0;
  videoEls.forEach((el, j) => {
    if (j !== i) return el.pause();
    el.currentTime = 0;
    if (!reducedMotion) el.play().catch(() => {});
  });
}

function onVideoEnded(i: number) {
  if (i === activeVideo.value) showVideo((i + 1) % HERO_VIDEOS.length);
}

// Smooth progress for the active tab's bar; timeupdate alone only fires a few times a second.
function trackProgress() {
  const el = videoEls[activeVideo.value];
  if (el && el.duration) videoProgress.value = el.currentTime / el.duration;
  progressFrame = requestAnimationFrame(trackProgress);
}

// The ports, shown as the landing page's tabs, rolling install commands and buttons (see ../languages.ts).
const INSTALLS = PORTS.map((p) => ({ lang: p.label, cmd: p.install, docs: p.docs, repo: p.repo }));

// The commands sit on the faces of a prism that rolls around its horizontal axis: one face per language, each
// 34px tall, so the prism's shape follows the length of INSTALLS.
const FACE_HEIGHT = 34;
const FACE_ANGLE = 360 / INSTALLS.length;
const PRISM_RADIUS = FACE_HEIGHT / 2 / Math.tan(Math.PI / INSTALLS.length);
const ROLL_EVERY_MS = 2800;

// Counts up as the prism rolls (and down when picking a language rolls it back), so the visible face is `turn`
// wrapped into 0..INSTALLS.length - 1. JavaScript's % keeps the sign, hence the extra wrap.
const turn = ref(0);
const face = computed(() => ((turn.value % INSTALLS.length) + INSTALLS.length) % INSTALLS.length);
// The selected language tab switches at the roll's midpoint, as the new face comes into view.
const noteFace = ref(0);
const rollPaused = ref(false);
// Once the visitor picks a language, the cube stays on it.
const picked = ref(false);

function pickLanguage(i: number) {
  picked.value = true;
  // Roll the short way round to the chosen face.
  let delta = (i - face.value + INSTALLS.length) % INSTALLS.length;
  if (delta > INSTALLS.length / 2) delta -= INSTALLS.length;
  turn.value += delta;
  noteFace.value = i;
}
let rollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Respect reduced motion: don't autoplay, and give the viewer controls instead.
  if (reducedMotion) videoEls.forEach((el) => (el.controls = true));
  showVideo(0);
  trackProgress();
  // Under reduced motion the cube stays on npm.
  if (!reducedMotion) {
    rollTimer = setInterval(() => {
      if (rollPaused.value || picked.value || document.hidden) return;
      turn.value++;
      setTimeout(() => (noteFace.value = face.value), 400);
    }, ROLL_EVERY_MS);
  }
});
onBeforeUnmount(() => {
  clearInterval(rollTimer);
  cancelAnimationFrame(progressFrame);
});

// "Get started" scrolls down to the ports, and puts #stacks in the address bar so the spot can be linked to.
// The scroll is animated here rather than with scrollIntoView({ behavior: "smooth" }), which browsers turn into
// a jump when their own smooth-scrolling setting is off. Visitors who ask for reduced motion get the jump.
const SCROLL_MS = 700;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function scrollToStacks() {
  const el = document.getElementById("stacks");
  if (!el) return;
  history.replaceState(history.state, "", "#stacks");
  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--vp-nav-height")) || 64;
  const from = window.scrollY;
  const to = Math.max(0, el.getBoundingClientRect().top + from - navHeight);
  if (reducedMotion || Math.abs(to - from) < 2) {
    window.scrollTo(0, to);
    return;
  }

  // Stop if the visitor starts scrolling themselves.
  let cancelled = false;
  const cancel = () => (cancelled = true);
  const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
  events.forEach((e) => window.addEventListener(e, cancel, { once: true, passive: true }));

  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / SCROLL_MS);
    if (cancelled) return;
    window.scrollTo(0, from + (to - from) * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
    else events.forEach((e) => window.removeEventListener(e, cancel));
  };
  requestAnimationFrame(step);
}

const copied = ref(false);
async function copyInstall() {
  try {
    await navigator.clipboard.writeText(INSTALLS[face.value].cmd);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1600);
  } catch {
    // Clipboard access can be blocked; the command is still selectable.
  }
}

/* The demo runs the real package on whatever is in the box. The samples are starting points to edit. */
const samples = [
  { label: "Romanized Nepali", text: "yo khatey payment app kahiley chaley po" },
  { label: "Devanagari", text: "मुजीको क्लास, कहिल्यै नआउनु" },
  { label: "English, leetspeak", text: "Great lecture, but the lab was sh1t." },
  { label: "Symbols", text: "this restro is @ss, sh!tf@ce owner" },
  { label: "x for chh", text: "xakka jasto kura nagar" },
  { label: "Spelled out", text: "F.U.C.K this assignment" },
  { label: "A real name", text: "Randip Thapa explained it really well" },
];

const active = ref<number | null>(0);
const mode = ref<"detect" | "censor">("censor");
const strictness = ref<Strictness>("strict");
const text = ref(samples[0].text);
const result = computed(() => check(text.value, { strictness: strictness.value }));

function pickSample(i: number) {
  active.value = i;
  text.value = samples[i].text;
}
// Editing the text deselects the sample it started from.
function onType() {
  if (active.value !== null && text.value !== samples[active.value].text) active.value = null;
}

// Splits the output into plain text and matches, so matches can be styled. The library merges overlapping matches
// before calling replace, so each one arrives once; private-use characters mark where it starts and ends.
const OPEN = "\uE000";
const CLOSE = "\uE001";
const graphemes =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? (s: string) => [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].map((g) => g.segment)
    : (s: string) => [...s];
const maskOf = (s: string) => graphemes(s).map((g) => (/^\s+$/.test(g) ? g : "*")).join("");
const outputSegments = computed(() => {
  const marked = result.value.censor({
    replace: (m) => OPEN + (mode.value === "censor" ? maskOf(m.text) : m.text) + CLOSE,
  });
  return marked
    .split(OPEN)
    .flatMap((part, i) => {
      if (i === 0) return [{ t: part, hit: false }];
      const [hit, rest] = part.split(CLOSE);
      return [{ t: hit, hit: true }, { t: rest, hit: false }];
    })
    .filter((seg) => seg.t);
});
const call = computed(() => "check(text, { strictness })" + (mode.value === "censor" ? ".censor()" : ".words"));

const snippets = [
  {
    label: "Censor",
    code: `import { censor } from "no-nepali-profanity";

censor("you muji");  // "you ****"
censor("F.U.C.K this Sh1t!");  // "******* this ****!"
censor("मुजीको क्लास");  // "*** क्लास"`,
  },
  {
    label: "Check and censor",
    code: `import { check } from "no-nepali-profanity";

const result = check(comment.body);

if (result.hasProfanity) {
  report(result.words);  // ["muji"]
}
save(result.censor());  // one scan for both`,
  },
  {
    label: "Configure",
    code: `import { createFilter } from "no-nepali-profanity";

const filter = createFilter({
  languages: ["romanized", "devanagari"],
  strictness: "lenient",
});

filter.containsProfanity("muji");  // true`,
  },
];
const snippet = ref(0);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function highlight(code: string): string {
  return escapeHtml(code).replace(
    /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|\b(import|from|const|if|return|await)\b/g,
    (_, comment, string, keyword) =>
      comment
        ? `<span class="tk-c">${comment}</span>`
        : string
          ? `<span class="tk-s">${string}</span>`
          : `<span class="tk-k">${keyword}</span>`
  );
}

const dodges = ["sh1t", "sh!t", "f*ck", "fuuuuck", "f.u.c.k", "ＦＵＣＫ"];
const grammar = ["mujiko", "gedaharu", "मुजीको", "गेडाहरू"];
const names = ["Shitij", "Kshitij", "Randip", "Kandel", "Putali", "Asha"];

const levels: { name: string; value: Strictness; text: string }[] = [
  { name: "Lenient", value: "lenient", text: "Severe profanity and slurs only." },
  { name: "Standard", value: "standard", text: "Adds milder insults like idiot, murkha and sala. The default." },
  { name: "Strict", value: "strict", text: "Adds words and stems that can also be ordinary words, like damn. Known names stay allowed." },
];
const level = ref(1);

const ports = PORTS.map((p) => ({
  name: p.name,
  pkg: p.registry,
  released: p.released,
  href: p.docs,
  repo: p.repo,
}));
</script>

<template>
  <div class="mx">
    <!-- Hero -->
    <section class="hero">
      <div class="wrap wrap-hero hero-grid">
        <div class="hero-copy">
        <p class="eyebrow">Open source · MIT licensed</p>
        <h1 class="hero-title">Nepali profanity filter <br />to keep it civil.</h1>
        <p class="hero-sub">
          Detect and censor abuse in English, Romanized Nepali and Devanagari.
        </p>
        <div class="langs" role="tablist" aria-label="Language">
          <button
            v-for="(c, i) in INSTALLS"
            :key="c.lang"
            type="button"
            role="tab"
            class="lang"
            :class="{ 'is-active': noteFace === i }"
            :aria-selected="noteFace === i"
            @click="pickLanguage(i)"
          >
            {{ c.lang }}
          </button>
        </div>
        <div class="hero-actions">
          <!-- vp-raw: VitePress's router would otherwise catch the click first and jump without animating -->
          <a class="btn btn-primary vp-raw" href="#stacks" @click.prevent="scrollToStacks">Get started</a>
        </div>
        <div
          class="install"
          @mouseenter="rollPaused = true"
          @mouseleave="rollPaused = false"
          @focusin="rollPaused = true"
          @focusout="rollPaused = false"
        >
          <div class="install-roller">
            <!-- Invisible copies of every command, stacked, so the pill is as wide as the longest one -->
            <div class="install-sizer" aria-hidden="true">
              <code v-for="c in INSTALLS" :key="c.cmd"><span class="install-prompt">$</span><span class="install-cmd">{{ c.cmd }}</span></code>
            </div>
            <div class="install-cube" :style="{ transform: `translateZ(${-PRISM_RADIUS}px) rotateX(${turn * FACE_ANGLE}deg)` }">
              <code
                v-for="(c, i) in INSTALLS"
                :key="c.cmd"
                class="install-face"
                :style="{ transform: `rotateX(${-i * FACE_ANGLE}deg) translateZ(${PRISM_RADIUS}px)` }"
                :aria-hidden="i !== face"
              ><span class="install-prompt" aria-hidden="true">$</span><span class="install-cmd">{{ c.cmd }}</span></code>
            </div>
          </div>
          <button
            class="install-copy"
            type="button"
            :aria-label="copied ? 'Copied' : `Copy: ${INSTALLS[face].cmd}`"
            :title="copied ? 'Copied' : `Copy: ${INSTALLS[face].cmd}`"
            @click="copyInstall"
          >
            <svg v-if="!copied" viewBox="0 0 20 20" aria-hidden="true"><rect x="6.5" y="6.5" width="10" height="10" rx="2.5" /><path d="M13.5 6.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h1.5" /></svg>
            <svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" /></svg>
          </button>
        </div>
        </div>

        <div class="hero-media">
          <div class="hero-screen">
            <video
              v-for="(v, i) in HERO_VIDEOS"
              :key="v.name"
              :ref="(el) => setVideoEl(el, i)"
              class="hero-video"
              :class="{ 'is-active': activeVideo === i }"
              muted
              playsinline
              preload="auto"
              :poster="v.poster"
              :aria-hidden="activeVideo !== i"
              :aria-label="v.caption"
              @ended="onVideoEnded(i)"
            >
              <source :src="v.webm" type="video/webm" />
              <source :src="v.mp4" type="video/mp4" />
            </video>
          </div>

          <div class="hero-tabs" role="tablist" aria-label="Demo videos">
            <button
              v-for="(v, i) in HERO_VIDEOS"
              :key="v.name"
              type="button"
              role="tab"
              class="hero-tab"
              :class="{ 'is-active': activeVideo === i }"
              :aria-selected="activeVideo === i"
              @click="showVideo(i)"
            >
              <span class="hero-tab-track" aria-hidden="true">
                <span :style="{ transform: `scaleX(${activeVideo === i ? videoProgress : 0})` }"></span>
              </span>
              <span class="hero-tab-label">{{ v.label }}</span>
              <span class="hero-tab-caption">{{ v.caption }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo -->
    <section class="demo-section">
      <div class="wrap wrap-wide">
        <h2 class="demo-heading">Try it on real comments.</h2>
        <div class="demo" aria-label="Interactive demo">
          <div class="demo-bar">
            <div class="demo-samples" role="tablist" aria-label="Sample comments">
              <button
                v-for="(s, i) in samples"
                :key="s.label"
                class="chip"
                role="tab"
                type="button"
                :aria-selected="active === i"
                :class="{ 'is-active': active === i }"
                @click="pickSample(i)"
              >
                {{ s.label }}
              </button>
            </div>
            <div class="demo-level">
              <span class="demo-level-label" id="demo-level-label">Strictness</span>
              <div class="segmented" role="group" aria-labelledby="demo-level-label">
                <button
                  v-for="l in levels"
                  :key="l.value"
                  type="button"
                  :title="l.text"
                  :aria-pressed="strictness === l.value"
                  :class="{ 'is-active': strictness === l.value }"
                  @click="strictness = l.value"
                >
                  {{ l.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="demo-body">
            <div class="demo-pane">
              <label class="demo-label" for="demo-input">Comment <span class="demo-hint">Edit it, or type your own</span></label>
              <textarea
                id="demo-input"
                v-model="text"
                class="demo-text demo-input"
                rows="3"
                maxlength="500"
                spellcheck="false"
                autocomplete="off"
                placeholder="Type a comment in English, Romanized Nepali or Devanagari…"
                @input="onType"
              ></textarea>
            </div>
            <div class="demo-pane demo-pane-out">
              <div class="demo-out-head">
                <p class="demo-label"><code>{{ call }}</code></p>
                <div class="segmented" role="group" aria-label="Mode">
                  <button type="button" :aria-pressed="mode === 'detect'" :class="{ 'is-active': mode === 'detect' }" @click="mode = 'detect'">Detect</button>
                  <button type="button" :aria-pressed="mode === 'censor'" :class="{ 'is-active': mode === 'censor' }" @click="mode = 'censor'">Censor</button>
                </div>
              </div>
              <p class="demo-text demo-output" aria-live="polite"><template v-for="(seg, i) in outputSegments" :key="i"><template v-if="!seg.hit">{{ seg.t }}</template><span v-else-if="mode === 'censor'" class="masked">{{ seg.t }}</span><mark v-else class="hit">{{ seg.t }}</mark></template></p>
              <p class="demo-status" :class="result.hasProfanity ? 'is-flagged' : 'is-clean'">
                <span class="dot" aria-hidden="true"></span>
                <template v-if="result.hasProfanity">
                  Flagged: <code v-for="w in result.words" :key="w">{{ w }}</code>
                </template>
                <template v-else-if="text.trim()">Clean. Nothing flagged.</template>
                <template v-else>Type something to check it.</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats">
      <div class="wrap stats-grid">
        <div><p class="stat">400+</p><p class="stat-label">words, stems and phrases</p></div>
        <div><p class="stat">8 KB</p><p class="stat-label">gzipped</p></div>
        <div><p class="stat">0</p><p class="stat-label">dependencies</p></div>
      </div>
    </section>

    <!-- Features -->
    <section class="section section-alt">
      <div class="wrap">
        <h2 class="section-title">Made for how Nepal types.</h2>
        <p class="section-sub">
          People write Nepali in two scripts, mix in English, and dodge filters on purpose. A word list built for
          English misses all of it.
        </p>

        <div class="bento">
          <article class="card card-wide">
            <h3>Reads through the dodges.</h3>
            <p>Leetspeak, symbols in place of letters, stretched and spelled-out words are all read as the word underneath.</p>
            <ul class="tokens">
              <li v-for="d in dodges" :key="d"><code>{{ d }}</code><span class="tag tag-hit">caught</span></li>
            </ul>
          </article>

          <article class="card">
            <h3>Knows Nepali grammar.</h3>
            <p>Postpositions and plurals glued to a word don't hide it, in either script.</p>
            <ul class="tokens tokens-col">
              <li v-for="g in grammar" :key="g"><code>{{ g }}</code><span class="tag tag-hit">caught</span></li>
            </ul>
          </article>

          <article class="card">
            <h3>Leaves names alone.</h3>
            <p>Real names that happen to contain a swear are checked in the test suite and pass.</p>
            <ul class="tokens tokens-col">
              <li v-for="n in names" :key="n"><code>{{ n }}</code><span class="tag tag-clean">clean</span></li>
            </ul>
          </article>

          <article class="card">
            <h3>Censors in place.</h3>
            <p>Masks exactly what was typed, down to the dots, and leaves the rest of the text as it was.</p>
            <div class="before-after">
              <p><span class="ba-label">Before</span><span>F.U.C.K this Sh1t!</span></p>
              <p><span class="ba-label">After</span><span><span class="masked">*******</span> this <span class="masked">****</span>!</span></p>
            </div>
          </article>

          <article class="card">
            <h3>Strict when you need it.</h3>
            <p>Three levels decide how much is caught. Pick one per filter.</p>
            <div class="segmented segmented-full" role="group" aria-label="Strictness">
              <button
                v-for="(l, i) in levels"
                :key="l.name"
                type="button"
                :aria-pressed="level === i"
                :class="{ 'is-active': level === i }"
                @click="level = i"
              >
                {{ l.name }}
              </button>
            </div>
            <p class="level-text">{{ levels[level].text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Code -->
    <section class="section">
      <div class="wrap">
        <h2 class="section-title">A few lines. That's it.</h2>
        <p class="section-sub">One import, plain functions, TypeScript types included. No setup, no API keys, no network calls.</p>

        <div class="code">
          <div class="code-tabs" role="tablist" aria-label="Code examples">
            <button
              v-for="(s, i) in snippets"
              :key="s.label"
              type="button"
              role="tab"
              :aria-selected="snippet === i"
              :class="{ 'is-active': snippet === i }"
              @click="snippet = i"
            >
              {{ s.label }}
            </button>
          </div>
          <pre><code v-html="highlight(snippets[snippet].code)"></code></pre>
        </div>

        <div class="center">
          <a class="btn-link" href="/js/usage">Read the usage guide <span aria-hidden="true">›</span></a>
        </div>
      </div>
    </section>

    <!-- Ports -->
    <section id="stacks" class="section section-alt">
      <div class="wrap wrap-wide">
        <h2 class="section-title">One lexicon. Every stack.</h2>
        <p class="section-sub">Each port shares the same word lists and matching rules, so a comment gets the same result in every language.</p>

        <div class="ports">
          <div v-for="p in ports" :key="p.name" class="port">
            <p class="port-name">{{ p.name }}</p>
            <p class="port-pkg">{{ p.pkg }}</p>
            <span v-if="!p.released" class="tag tag-muted">Planned</span>
            <div class="port-actions">
              <a class="port-btn port-btn-docs" :href="p.href" :aria-label="`${p.name} docs`">Docs</a>
              <a
                v-if="p.repo"
                class="port-btn port-btn-repo"
                :href="p.repo"
                target="_blank"
                rel="noopener"
                :aria-label="`${p.name} on GitHub`"
                :title="`${p.name} on GitHub`"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Coverage: what it misses, and how to help -->
    <section class="section coverage">
      <div class="wrap">
        <h2 class="section-title">It won't catch every bad word.</h2>
        <p class="section-sub">
          Slang changes fast, and no word list is ever complete. If something slips through, or a real name gets
          flagged, open an issue or add the word yourself. Reviews from native Nepali speakers help the most.
        </p>
        <div class="coverage-actions">
          <a class="btn btn-primary" :href="`${GITHUB}/issues/new`" target="_blank" rel="noopener">Suggest a word</a>
          <a class="btn-link" href="/js/contributing">How to contribute <span aria-hidden="true">›</span></a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="wrap footer-grid">
        <nav aria-label="Documentation">
          <p class="footer-head">Docs</p>
          <a href="/js/">Introduction</a>
          <a href="/js/installation">Installation</a>
          <a href="/js/censoring">Censoring</a>
          <a href="/js/api">API reference</a>
        </nav>
        <nav aria-label="Project">
          <p class="footer-head">Project</p>
          <a :href="GITHUB" target="_blank" rel="noopener">GitHub</a>
          <a href="/js/changelog">Changelog</a>
          <a href="/js/contributing">Contributing</a>
          <a href="/js/limitations">Limitations</a>
        </nav>
      </div>
      <div class="wrap footer-legal">
        <p>Built with purpose</p>
        <p><a href="https://momik.dev" target="_blank" rel="noopener">Momik Shrestha</a></p>
        <p>Released under the MIT License</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.mx {
  background: var(--mx-bg);
  color: var(--mx-text);
}

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 24px;
}
.wrap-wide {
  max-width: 1080px;
}
/* Wider than the other sections, with side margins that grow with the viewport */
.wrap-hero {
  max-width: 90rem;
  padding-inline: clamp(1.5rem, 5vw, 5rem);
}

/* Hero */
/*
 * A faint dot grid behind the hero, fading out towards the edges, so the video frame reads as sitting on top of
 * the page instead of blending into it.
 */
.hero {
  position: relative;
  isolation: isolate;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: radial-gradient(var(--mx-dot) 1px, transparent 1.2px);
  background-size: 22px 22px;
  background-position: center top;
  -webkit-mask-image: radial-gradient(ellipse 75% 85% at 50% 35%, #000 35%, transparent 100%);
  mask-image: radial-gradient(ellipse 75% 85% at 50% 35%, #000 35%, transparent 100%);
  pointer-events: none;
}
.hero {
  padding: 88px 0 96px;
}
.hero-grid {
  display: grid;
  /* The video gets the larger share: it's a recording of a full page, and its text is unreadable much smaller */
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}
.hero-copy {
  container-type: inline-size;
}
.hero-grid .hero-title {
  /* Sized to the text column's width, so "Nepali profanity filter" still fits on one line */
  font-size: clamp(2.25rem, 9.5cqi, 3.5rem);
}
.eyebrow {
  font-size: 14px;
  font-weight: 500;
  color: var(--mx-text-2);
  margin: 0 0 20px;
}
.hero-title {
  font-size: clamp(40px, 5.2vw, 64px);
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -0.035em;
  margin: 0;
}
.hero-sub {
  max-width: 520px;
  margin: 24px 0 0;
  font-size: clamp(17px, 2.2vw, 21px);
  line-height: 1.45;
  color: var(--mx-text-2);
  letter-spacing: -0.005em;
}
.langs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 32px;
}
.lang {
  height: 32px;
  padding: 0 14px;
  border-radius: 980px;
  font-size: 14px;
  font-weight: 500;
  color: var(--mx-text-2);
  background: var(--mx-bg-alt);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.lang:hover {
  color: var(--mx-text);
}
.lang.is-active {
  background: var(--mx-text);
  color: var(--mx-bg);
}
/* Tabs, buttons and install command sit the same distance apart */
.langs + .hero-actions,
.hero-actions + .install {
  margin-top: 24px;
}
.hero-actions {
  display: flex;
  gap: 28px;
  align-items: center;
  margin-top: 36px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 22px;
  border-radius: 980px;
  font-size: 17px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.btn-primary {
  background: var(--vp-button-brand-bg);
  color: #fff;
}
.btn-primary:hover {
  background: var(--vp-button-brand-hover-bg);
}
.btn-link {
  font-size: 17px;
  color: var(--mx-blue);
  text-decoration: none;
}
.btn-link:hover {
  text-decoration: underline;
}
.btn:focus-visible,
.btn-link:focus-visible,
button:focus-visible,
.port-btn:focus-visible {
  outline: 2px solid var(--mx-blue);
  outline-offset: 3px;
}

.install {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 36px;
  padding: 8px 8px 8px 20px;
  border: 1px solid var(--mx-hairline);
  border-radius: 14px;
  background: var(--mx-bg-alt);
  max-width: 100%;
}
/* The rolling cube: four faces around the X axis, each 34px tall, so each sits 17px from the centre */
.install-roller {
  position: relative;
  min-width: 0;
  height: 34px;
  perspective: 600px;
  /* Show one face only: with more than four faces, the neighbours tilt into view above and below */
  overflow: hidden;
}
.install-sizer {
  display: grid;
  height: 34px;
  visibility: hidden;
}
.install-sizer > code {
  grid-area: 1 / 1;
}
.install-cube {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}
.install-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--mx-bg-alt);
}
.install-sizer > code,
.install-face {
  display: flex;
  align-items: center;
  gap: 1ch;
  min-width: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 34px;
  color: var(--mx-text);
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
}
.install-cmd {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.install-prompt {
  flex-shrink: 0;
}
.install-prompt {
  color: var(--mx-text-3);
  user-select: none;
}
.install-copy {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: var(--mx-text-2);
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}
.install-copy:hover {
  background: var(--mx-hairline);
}
.install-copy svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Hero media: the demo videos, cross-fading from one to the next, with tabs underneath */
.hero-media {
  position: relative;
  width: 100%;
}
.hero-screen {
  position: relative;
  width: 100%;
  /* The recordings' own shape, so they fill the frame without cropping or stretching */
  aspect-ratio: 1920 / 1210;
  border-radius: 0.75rem;
  border: 1px solid var(--mx-screen-border);
  background: var(--mx-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 24px 60px rgba(0, 0, 0, 0.14);
  overflow: hidden;
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.45s ease;
}
.hero-video.is-active {
  opacity: 1;
}
.hero-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.875rem, 2%, 1.25rem);
  margin-top: 1.25rem;
}
.hero-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  color: var(--mx-text-3);
  transition: color 0.2s ease;
}
.hero-tab:hover,
.hero-tab.is-active {
  color: var(--mx-text);
}
.hero-tab-track {
  position: relative;
  display: block;
  width: 100%;
  height: 2px;
  margin-bottom: 10px;
  border-radius: 1px;
  background: var(--mx-hairline);
  overflow: hidden;
}
.hero-tab-track span {
  position: absolute;
  inset: 0;
  background: var(--mx-text);
  transform-origin: left;
  transform: scaleX(0);
}
.hero-tab-label {
  font-size: 15px;
  font-weight: 600;
}
.hero-tab-caption {
  font-size: 13px;
  line-height: 1.45;
  color: var(--mx-text-2);
}

/* Demo */
.demo-section {
  padding: 0 0 24px;
}
.demo-heading {
  margin: 0 0 28px;
  text-align: center;
  font-size: clamp(26px, 3.4vw, 32px);
  font-weight: 650;
  letter-spacing: -0.025em;
  border: 0;
  padding: 0;
}
.demo {
  text-align: left;
  border: 1px solid var(--mx-hairline);
  border-radius: 12px 12px 0 0;
  background: var(--mx-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.demo-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--mx-hairline);
}
.demo-bar .demo-samples {
  flex: 1;
}
.demo-level {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
}
.demo-level-label {
  font-size: 13px;
  color: var(--mx-text-2);
}
.demo-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: -6px 0 12px;
}
.demo-out-head .demo-label {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
.demo-out-head .segmented {
  background: var(--mx-hairline);
}
.demo-samples {
  display: flex;
  min-width: 0;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.demo-samples::-webkit-scrollbar {
  display: none;
}
.chip {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border-radius: 980px;
  font-size: 14px;
  color: var(--mx-text-2);
  background: var(--mx-bg-alt);
  transition: background-color 0.2s ease, color 0.2s ease;
}
.chip:hover {
  color: var(--mx-text);
}
.chip.is-active {
  background: var(--mx-text);
  color: var(--mx-bg);
}

.segmented {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  border-radius: 10px;
  background: var(--mx-bg-alt);
}
.segmented button {
  height: 28px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mx-text-2);
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.segmented button.is-active {
  background: var(--mx-card);
  color: var(--mx-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
.segmented-full {
  display: flex;
  margin-top: 20px;
}
.segmented-full button {
  flex: 1;
}

.demo-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.demo-pane {
  padding: 28px 28px 32px;
}
.demo-pane-out {
  border-left: 1px solid var(--mx-hairline);
  background: var(--mx-bg-alt);
}
.demo-label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mx-text-3);
}
.demo-label code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  background: none;
  padding: 0;
  color: var(--mx-text-2);
}
.demo-text {
  margin: 0;
  font-size: 22px;
  line-height: 1.45;
  letter-spacing: -0.01em;
  min-height: 64px;
  word-break: break-word;
}
.demo-output {
  white-space: pre-wrap;
}
.demo-input {
  display: block;
  width: 100%;
  min-height: calc(3 * 1.45em);
  padding: 0;
  border: 0;
  resize: none;
  field-sizing: content; /* grows with the text where supported */
  background: transparent;
  color: var(--mx-text);
  font: inherit;
  font-size: 22px;
  line-height: 1.45;
  outline: none;
}
.demo-input::placeholder {
  color: var(--mx-text-3);
}
.demo-pane:has(.demo-input:focus-visible) {
  box-shadow: inset 0 0 0 2px var(--mx-blue);
}
.demo-hint {
  margin-left: 6px;
  font-weight: 400;
  color: var(--mx-text-3);
}
.masked {
  color: var(--mx-crimson);
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.02em;
}
.hit {
  background: var(--mx-crimson-soft);
  color: var(--mx-crimson);
  border-radius: 6px;
  padding: 0 3px;
}
.demo-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 20px 0 0;
  font-size: 14px;
  color: var(--mx-text-2);
}
.demo-status code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--mx-card);
  border: 1px solid var(--mx-hairline);
  color: var(--mx-text);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}
.is-flagged .dot {
  background: var(--mx-crimson);
}
.is-clean .dot {
  background: var(--mx-green);
}

/* Stats */
.stats {
  padding: 64px 0 88px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;
}
.stat {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.stat-label {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--mx-text-2);
}

/* Sections */
.section {
  padding: 112px 0;
}
.section-alt {
  background: var(--mx-bg-alt);
}
.section-title {
  margin: 0;
  text-align: center;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.03em;
  border: 0;
  padding: 0;
}
.section-sub {
  max-width: 600px;
  margin: 18px auto 0;
  text-align: center;
  font-size: 19px;
  line-height: 1.5;
  color: var(--mx-text-2);
}
.center {
  text-align: center;
  margin-top: 32px;
}

/* Bento */
.bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 64px;
}
.card {
  padding: 32px;
  border-radius: 12px;
  background: var(--mx-card);
}
.card-wide {
  grid-column: 1 / -1;
}
.card h3 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.card > p {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.5;
  color: var(--mx-text-2);
}
.tokens {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}
.tokens-col {
  grid-template-columns: repeat(2, 1fr);
}
.tokens li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--mx-bg-alt);
}
.tokens code {
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
  background: none;
  padding: 0;
  color: var(--mx-text);
}
.tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 980px;
  white-space: nowrap;
}
.tag-hit {
  color: var(--mx-crimson);
  background: var(--mx-crimson-soft);
}
.tag-clean {
  color: var(--mx-green);
  background: color-mix(in srgb, var(--mx-green) 12%, transparent);
}
.tag-live {
  color: var(--mx-blue);
  background: var(--vp-c-brand-soft);
}
.tag-muted {
  color: var(--mx-text-2);
  background: var(--mx-bg-alt);
}

.before-after {
  margin-top: 24px;
  border-radius: 8px;
  background: var(--mx-bg-alt);
  padding: 4px 16px;
}
.before-after p {
  display: flex;
  gap: 14px;
  align-items: baseline;
  margin: 0;
  padding: 12px 0;
  font-size: 17px;
}
.before-after p + p {
  border-top: 1px solid var(--mx-hairline);
}
.ba-label {
  width: 44px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--mx-text-3);
}
.level-text {
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--mx-text-2);
  min-height: 45px;
}

/* Code */
.code {
  margin: 56px auto 0;
  max-width: 720px;
  border-radius: 20px;
  background: #1d1d1f;
  overflow: hidden;
  text-align: left;
}
.dark .code {
  background: #161618;
  border: 1px solid var(--mx-hairline);
}
.code-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 12px 0;
  overflow-x: auto;
}
.code-tabs button {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #a1a1a6;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.code-tabs button:hover {
  color: #f5f5f7;
}
.code-tabs button.is-active {
  background: rgba(255, 255, 255, 0.1);
  color: #f5f5f7;
}
.code pre {
  margin: 0;
  padding: 20px 24px 28px;
  overflow-x: auto;
}
.code pre code {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.7;
  color: #f5f5f7;
  background: none;
  padding: 0;
}
.code :deep(.tk-c) {
  color: #86868b;
}
.code :deep(.tk-s) {
  color: #ffb4a2;
}
.code :deep(.tk-k) {
  color: #9ec1ff;
}

/* Ports */
.ports {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 56px;
}
.port {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border-radius: 20px;
  background: var(--mx-card);
  color: var(--mx-text);
}
.port-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
/* Docs and GitHub on one line */
.port-actions {
  display: flex;
  gap: 6px;
  width: 100%;
  margin-top: auto;
}
.port-btn {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--mx-hairline);
  font-size: 13px;
  white-space: nowrap;
  font-weight: 500;
  color: var(--mx-text);
  text-decoration: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.port-btn:hover {
  background: var(--mx-bg-alt);
  border-color: var(--mx-text-3);
}
.port-btn-docs {
  border-color: transparent;
  background: var(--vp-button-brand-bg);
  color: #fff;
}
.port-btn-docs:hover {
  border-color: transparent;
  background: var(--vp-button-brand-hover-bg);
}
/* Icon only, square */
.port-btn-repo {
  flex: 0 0 auto;
  width: 32px;
  padding: 0;
}
.port-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
.port-pkg {
  margin: 4px 0 20px;
  font-size: 14px;
  color: var(--mx-text-2);
}
#stacks {
  scroll-margin-top: var(--vp-nav-height, 64px);
}
.port .tag {
  margin-bottom: 16px;
}

/* Coverage */
.coverage-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 32px;
}

/* Footer */
.footer {
  border-top: 1px solid var(--mx-hairline);
  background: var(--mx-bg-alt);
  padding: 48px 0 32px;
  font-size: 14px;
}
.footer-grid {
  display: flex;
  justify-content: space-between;
  gap: 32px;
}
.footer nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-head {
  margin: 0 0 4px;
  font-weight: 600;
  color: var(--mx-text);
}
.footer nav a {
  color: var(--mx-text-2);
  text-decoration: none;
}
.footer nav a:hover {
  color: var(--mx-text);
}
.footer-legal {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--mx-hairline);
}
.footer-legal p {
  margin: 0;
  color: var(--mx-text-3);
  font-size: 13px;
}
.footer-legal a {
  color: var(--mx-text-2);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.footer-legal a:hover {
  color: var(--mx-text);
}

/* Stack the hero before the video gets smaller than it would be stacked */
@media (max-width: 1240px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: clamp(2.5rem, 6vw, 3.5rem);
  }
  .hero-grid .hero-title {
    font-size: clamp(2.5rem, 5.2vw, 4rem);
  }
  .hero-copy {
    max-width: 40rem;
  }
}

/* Five port cards in a row get too narrow for their two buttons */
@media (max-width: 1100px) {
  .ports {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet */
@media (max-width: 860px) {
  .ports {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Phone */
@media (max-width: 640px) {
  .wrap {
    padding: 0 16px;
  }
  .hero {
    padding: 56px 0 72px;
  }
  .hero-title br {
    display: none;
  }
  .install {
    padding-left: 14px;
    gap: 6px;
  }
  .install-sizer > code,
  .install-face {
    font-size: 12px;
  }
  .demo-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .demo-level {
    justify-content: space-between;
  }
  .demo-body {
    grid-template-columns: 1fr;
  }
  .demo-pane {
    padding: 22px 20px 24px;
  }
  .demo-pane-out {
    border-left: 0;
    border-top: 1px solid var(--mx-hairline);
  }
  .demo-text {
    font-size: 19px;
    min-height: 0;
  }
  .stats-grid {
    gap: 12px;
  }
  .stat {
    font-size: 28px;
  }
  .section {
    padding: 80px 0;
  }
  .bento {
    grid-template-columns: 1fr;
    margin-top: 44px;
  }
  .card {
    padding: 24px;
  }
  .tokens {
    grid-template-columns: repeat(2, 1fr);
  }
  .ports {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
