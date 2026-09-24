<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const GITHUB = "https://github.com/PG-Momik/no-nepali-profanity";

/*
 * Hero video. Put the files in docs/public/media/ and set the paths here, e.g. "/media/hero.mp4". While `mp4` is
 * empty, the hero shows a static mock of the same scene instead.
 */
const HERO_VIDEO = {
  mp4: "",
  webm: "",
  poster: "",
};

/*
 * Install commands for each port, shown on the faces of a rolling cube, with a note underneath that follows the
 * visible face. Only JavaScript exists so far. The Composer vendor and the Go module path are placeholders until
 * those repos exist.
 */
const INSTALLS = [
  { cmd: "npm install no-nepali-profanity", note: "Pre-release. JavaScript is first, and on npm soon." },
  { cmd: "pip install no-nepali-profanity", note: "Python port: coming soon." },
  { cmd: "composer require pg-momik/no-nepali-profanity", note: "PHP and Laravel port: coming soon." },
  { cmd: "go get github.com/PG-Momik/no-nepali-profanity-go", note: "Go port: coming soon." },
];
const ROLL_EVERY_MS = 2800;

// Counts up forever so the cube always rolls the same way; the visible face is `turn % 4`.
const turn = ref(0);
const face = computed(() => turn.value % INSTALLS.length);
// The note under the pill switches at the roll's midpoint, as the new face comes into view.
const noteFace = ref(0);
const rollPaused = ref(false);
let rollTimer: ReturnType<typeof setInterval> | undefined;

const heroVideo = ref<HTMLVideoElement | null>(null);
onMounted(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Respect reduced motion: don't autoplay, and give the viewer controls instead.
  if (heroVideo.value && reducedMotion) {
    heroVideo.value.pause();
    heroVideo.value.controls = true;
  }
  // Under reduced motion the cube stays on npm.
  if (!reducedMotion) {
    rollTimer = setInterval(() => {
      if (rollPaused.value || document.hidden) return;
      turn.value++;
      setTimeout(() => (noteFace.value = face.value), 400);
    }, ROLL_EVERY_MS);
  }
});
onBeforeUnmount(() => clearInterval(rollTimer));

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

/*
 * Demo data. Generated from the package's own check() and censor() output, so every result shown here is what
 * the library really returns. `m` is the masked form of a matched segment.
 */
type Segment = { t: string; m?: string };
const samples: { label: string; segments: Segment[]; words: string[] }[] = [
  {
    label: "English, leetspeak",
    segments: [{ t: "Great lecture, but the lab was " }, { t: "sh1t", m: "****" }, { t: "." }],
    words: ["shit"],
  },
  {
    label: "Spelled out",
    segments: [{ t: "F.U.C.K", m: "*******" }, { t: " this assignment" }],
    words: ["fuck"],
  },
  {
    label: "Devanagari",
    segments: [{ t: "मुजीको", m: "***" }, { t: " कक्षा, कहिल्यै नआउनु" }],
    words: ["मुजीको"],
  },
  {
    label: "Romanized Nepali",
    segments: [{ t: "yo exam ta " }, { t: "muji jasto", m: "**** *****" }, { t: " thiyo" }],
    words: ["muji", "muji jasto"],
  },
  {
    label: "Nepali phrase",
    segments: [{ t: "sasto manche", m: "***** ******" }, { t: " jasto kura nagara" }],
    words: ["sasto manche"],
  },
  {
    label: "A real name",
    segments: [{ t: "Randip Thapa explained it really well" }],
    words: [],
  },
  {
    label: "Another name",
    segments: [{ t: "Shitij sir ko class ramro thiyo" }],
    words: [],
  },
];

const active = ref(0);
const mode = ref<"detect" | "censor">("censor");
const current = computed(() => samples[active.value]);
const inputText = computed(() => current.value.segments.map((s) => s.t).join(""));
const call = computed(() =>
  mode.value === "censor" ? "check(text).censor()" : "check(text).words"
);

const snippets = [
  {
    label: "Censor",
    code: `import { censor } from "no-nepali-profanity";

censor("you muji");  // "you ****"
censor("F.U.C.K this Sh1t!");  // "******* this ****!"
censor("मुजीको कक्षा");  // "*** कक्षा"`,
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
const grammar = ["mujiko", "randiharu", "मुजीको", "मुजीहरू"];
const names = ["Shitij", "Kshitij", "Randip", "Kandel", "Putali", "Asha"];

const levels = [
  { name: "Lenient", text: "Severe profanity and slurs only." },
  { name: "Standard", text: "Adds milder insults like idiot, murkha and sala. The default." },
  { name: "Strict", text: "Adds word stems that can also match names. For review queues." },
];
const level = ref(1);

const ports = [
  { name: "JavaScript & TypeScript", pkg: "npm", status: "Pre-release", href: "/js/" },
  { name: "Python", pkg: "PyPI", status: "Planned" },
  { name: "PHP & Laravel", pkg: "Packagist", status: "Planned" },
  { name: "Go", pkg: "Go modules", status: "Planned" },
];
</script>

<template>
  <div class="mx">
    <!-- Hero -->
    <section class="hero">
      <div class="wrap wrap-hero hero-grid">
        <div class="hero-copy">
        <p class="eyebrow">Open source · MIT licensed</p>
        <h1 class="hero-title">Profanity filtering <br />that understands Nepali.</h1>
        <p class="hero-sub">
          Detect and censor abuse in English, Romanized Nepali and Devanagari. Built to catch the dodges, and to
          leave your users' real names alone.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/js/">Get started</a>
          <a class="btn-link" :href="GITHUB" target="_blank" rel="noopener">
            View on GitHub <span aria-hidden="true">›</span>
          </a>
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
            <div class="install-cube" :style="{ transform: `translateZ(-17px) rotateX(${turn * 90}deg)` }">
              <code
                v-for="(c, i) in INSTALLS"
                :key="c.cmd"
                class="install-face"
                :style="{ transform: `rotateX(${-i * 90}deg) translateZ(17px)` }"
                :aria-hidden="i !== face"
              ><span class="install-prompt" aria-hidden="true">$</span><span class="install-cmd">{{ c.cmd }}</span></code>
            </div>
          </div>
          <button class="install-copy" type="button" :aria-label="copied ? 'Copied' : 'Copy install command'" @click="copyInstall">
            <svg v-if="!copied" viewBox="0 0 20 20" aria-hidden="true"><rect x="6.5" y="6.5" width="10" height="10" rx="2.5" /><path d="M13.5 6.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h1.5" /></svg>
            <svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" /></svg>
          </button>
        </div>
        <Transition name="note" mode="out-in">
          <p :key="noteFace" class="install-note">{{ INSTALLS[noteFace].note }}</p>
        </Transition>
        </div>

        <div class="hero-media">
          <video
            v-if="HERO_VIDEO.mp4"
            ref="heroVideo"
            class="hero-video"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            :poster="HERO_VIDEO.poster || undefined"
            aria-label="A review form rejecting a comment that contains profanity"
          >
            <source v-if="HERO_VIDEO.webm" :src="HERO_VIDEO.webm" type="video/webm" />
            <source :src="HERO_VIDEO.mp4" type="video/mp4" />
          </video>

          <!-- Placeholder until the video is recorded: the same scene, static -->
          <div v-else class="mock" role="img" aria-label="A review form rejecting a comment that contains profanity">
            <div class="mock-chrome">
              <span class="mock-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="mock-url">yourapp.com/courses/cs101/reviews</span>
            </div>
            <div class="mock-page">
              <p class="mock-kicker">CS101 · Data Structures</p>
              <p class="mock-title">Write a review</p>
              <p class="mock-field-label">Your review</p>
              <div class="mock-field is-error">
                Lecturer ta <span class="mock-hit">muji jasto</span> cha
              </div>
              <p class="mock-error">
                <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" /><path d="M8 4.5v4M8 11h.01" /></svg>
                Your review contains language that isn't allowed.
              </p>
              <div class="mock-actions">
                <span class="mock-btn is-disabled">Post review</span>
              </div>
            </div>
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
                @click="active = i"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <div class="demo-body">
            <div class="demo-pane">
              <p class="demo-label">Comment</p>
              <p class="demo-text">{{ inputText }}</p>
            </div>
            <div class="demo-pane demo-pane-out">
              <div class="demo-out-head">
                <p class="demo-label"><code>{{ call }}</code></p>
                <div class="segmented" role="group" aria-label="Mode">
                  <button type="button" :aria-pressed="mode === 'detect'" :class="{ 'is-active': mode === 'detect' }" @click="mode = 'detect'">Detect</button>
                  <button type="button" :aria-pressed="mode === 'censor'" :class="{ 'is-active': mode === 'censor' }" @click="mode = 'censor'">Censor</button>
                </div>
              </div>
              <p v-if="mode === 'censor'" class="demo-text">
                <template v-for="(seg, i) in current.segments" :key="i">
                  <span v-if="seg.m" class="masked">{{ seg.m }}</span><template v-else>{{ seg.t }}</template>
                </template>
              </p>
              <p v-else class="demo-text">
                <template v-for="(seg, i) in current.segments" :key="i">
                  <mark v-if="seg.m" class="hit">{{ seg.t }}</mark><template v-else>{{ seg.t }}</template>
                </template>
              </p>
              <p class="demo-status" :class="current.words.length ? 'is-flagged' : 'is-clean'">
                <span class="dot" aria-hidden="true"></span>
                <template v-if="current.words.length">
                  Flagged: <code v-for="w in current.words" :key="w">{{ w }}</code>
                </template>
                <template v-else>Clean. Nothing flagged.</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats">
      <div class="wrap stats-grid">
        <div><p class="stat">3</p><p class="stat-label">scripts in one pass</p></div>
        <div><p class="stat">280+</p><p class="stat-label">words, stems and phrases</p></div>
        <div><p class="stat">5.5 KB</p><p class="stat-label">gzipped</p></div>
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
    <section class="section section-alt">
      <div class="wrap">
        <h2 class="section-title">One lexicon. Every stack.</h2>
        <p class="section-sub">Each port shares the same word lists and matching rules, so a comment gets the same result in every language.</p>

        <div class="ports">
          <component
            :is="p.href ? 'a' : 'div'"
            v-for="p in ports"
            :key="p.name"
            class="port"
            :class="{ 'port-live': p.href }"
            :href="p.href"
          >
            <p class="port-name">{{ p.name }}</p>
            <p class="port-pkg">{{ p.pkg }}</p>
            <span class="tag" :class="p.href ? 'tag-live' : 'tag-muted'">{{ p.status }}</span>
          </component>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="section cta">
      <div class="wrap">
        <h2 class="cta-title">Keep the conversation civil.</h2>
        <p class="section-sub">Add it to your comment section, sign-up form or chat in a few minutes.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/js/installation">Install</a>
          <a class="btn-link" href="/js/examples">See examples <span aria-hidden="true">›</span></a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="wrap footer-grid">
        <div class="footer-brand">
          <img src="/logo.svg" alt="" width="24" height="24" />
          <span>mukh-xadna-hunna</span>
        </div>
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
        <p>Released under the MIT License. © 2026 PG-Momik.</p>
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
.wrap-hero {
  max-width: 1200px;
}

/* Hero */
.hero {
  padding: 88px 0 96px;
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 64px;
  align-items: center;
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
.port:focus-visible {
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
.note-enter-active,
.note-leave-active {
  transition: opacity 0.3s ease;
}
.note-enter-from,
.note-leave-to {
  opacity: 0;
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
.install-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--mx-text-3);
}

/* Hero media: the video, or the mock that stands in for it */
.hero-media {
  position: relative;
}
.hero-video,
.mock {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  border: 1px solid var(--mx-hairline);
  background: var(--mx-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 24px 60px rgba(0, 0, 0, 0.1);
}
.hero-video {
  object-fit: cover;
}
/* No overflow: hidden here, so the frame can grow past 16:10 when its content needs the room */
.mock {
  display: flex;
  flex-direction: column;
  text-align: left;
}
.mock-chrome {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid var(--mx-hairline);
  border-radius: 19px 19px 0 0;
  background: var(--mx-bg-alt);
  flex-shrink: 0;
}
.mock-dots {
  display: flex;
  gap: 6px;
}
.mock-dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--mx-hairline);
}
.mock-url {
  flex: 1;
  max-width: 320px;
  margin: 0 auto;
  padding: 4px 12px;
  border-radius: 7px;
  background: var(--mx-card);
  font-size: 12px;
  color: var(--mx-text-3);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mock-page {
  flex: 1;
  padding: 20px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.mock-kicker {
  margin: 0;
  font-size: 13px;
  color: var(--mx-text-3);
}
.mock-title {
  margin: 2px 0 16px;
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.mock-field-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mx-text-2);
}
.mock-field {
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--mx-hairline);
  font-size: 16px;
  line-height: 1.5;
}
.mock-field.is-error {
  border-color: var(--mx-crimson);
  box-shadow: 0 0 0 3px var(--mx-crimson-soft);
}
.mock-hit {
  color: var(--mx-crimson);
  text-decoration: underline wavy var(--mx-crimson);
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
}
.mock-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--mx-crimson);
}
.mock-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
}
.mock-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.mock-btn {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 18px;
  border-radius: 980px;
  font-size: 15px;
  font-weight: 500;
  background: var(--vp-button-brand-bg);
  color: #fff;
}
.mock-btn.is-disabled {
  opacity: 0.35;
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
  border-radius: 12px;
  background: var(--mx-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.demo-bar {
  padding: 16px;
  border-bottom: 1px solid var(--mx-hairline);
}
.demo-out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: -6px 0 12px;
}
.demo-out-head .demo-label {
  margin: 0;
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
  grid-template-columns: repeat(4, 1fr);
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 56px;
}
.port {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  border-radius: 20px;
  background: var(--mx-card);
  color: var(--mx-text);
  text-decoration: none;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;
}
.port-live:hover {
  border-color: var(--mx-blue);
}
.port-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.port-pkg {
  margin: 4px 0 20px;
  font-size: 14px;
  color: var(--mx-text-2);
}
.port .tag {
  margin-top: auto;
}

/* Closing CTA */
.cta {
  text-align: center;
}
.cta-title {
  margin: 0;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.035em;
  border: 0;
  padding: 0;
}

/* Footer */
.footer {
  border-top: 1px solid var(--mx-hairline);
  background: var(--mx-bg-alt);
  padding: 48px 0 32px;
  font-size: 14px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 32px;
}
.footer-brand {
  align-self: start;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
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
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--mx-hairline);
}
.footer-legal p {
  margin: 0;
  color: var(--mx-text-3);
  font-size: 13px;
}

/* Stack the hero once the text column gets too narrow for the longest install command */
@media (max-width: 1100px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 56px;
  }
  .hero-copy {
    max-width: 620px;
  }
  .hero-media {
    max-width: 720px;
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
  .hero-grid {
    gap: 40px;
  }
  .mock {
    aspect-ratio: auto;
  }
  .mock-page {
    padding: 24px 20px;
  }
  .mock-field {
    min-height: 84px;
  }
  .mock-title {
    font-size: 20px;
    margin-bottom: 18px;
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
    grid-template-columns: repeat(2, 1fr);
    row-gap: 32px;
  }
  .stat {
    font-size: 34px;
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
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
