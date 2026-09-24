# mukhxadnahunna.com

Documentation site for the `no-nepali-profanity` packages, built with [VitePress](https://vitepress.dev) and hosted on
GitHub Pages at <https://mukhxadnahunna.com>.

## Structure

```
docs/
  index.md            landing page for all ports
  js/                 JavaScript / TypeScript port
  public/CNAME        custom domain for GitHub Pages
  .vitepress/config.mts   nav, sidebar and repository links
```

To add a port (for example PHP), create `docs/php/`, add a sidebar entry under `"/php/"` in `config.mts`, and update
the table and nav on the landing page.

## Hero video

The landing page hero shows a video of a form submission being blocked. Until one is added, it shows a static
mock of the same scene.

**Recording**

- Record at **16:10**, e.g. 2560×1600 or 1920×1200. The frame is 16:10, and the video is cropped to fill it.
- Keep it short (6 to 12 seconds) and make it loop cleanly: end on the same frame it starts on.
- There's no sound: the video autoplays muted.
- Use a clean browser window with no bookmarks bar or extensions, and zoom in (125 to 150%) so text is readable
  at the size it's shown on the page.

**Encoding**

```sh
# MP4 (H.264): plays everywhere. Aim for 2 to 4 MB.
ffmpeg -i raw.mov -vf "scale=1920:1200:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 22 \
  -pix_fmt yuv420p -movflags +faststart -an docs/public/media/hero.mp4

# WebM (VP9): smaller, used by browsers that support it.
ffmpeg -i raw.mov -vf "scale=1920:1200:flags=lanczos,fps=30" -c:v libvpx-vp9 -crf 34 -b:v 0 -an \
  docs/public/media/hero.webm

# Poster: the first frame, shown while the video loads.
ffmpeg -i docs/public/media/hero.mp4 -frames:v 1 -q:v 3 docs/public/media/hero-poster.jpg
```

Then set the paths at the top of `docs/.vitepress/theme/components/Landing.vue`:

```ts
const HERO_VIDEO = {
  mp4: "/media/hero.mp4",
  webm: "/media/hero.webm",
  poster: "/media/hero-poster.jpg",
};
```

Visitors who have reduced motion turned on get a paused video with controls instead of autoplay.

## Local development

```sh
npm install
npm run docs:dev       # dev server with hot reload
npm run docs:build     # production build in docs/.vitepress/dist
npm run docs:preview   # serve the production build
```

## Deploying

`.github/workflows/deploy.yml` builds and deploys the site on every push to `main`.

One-time setup:

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. At your DNS provider, point the domain at GitHub Pages:
   - Four `A` records for `mukhxadnahunna.com`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`.
   - A `CNAME` record for `www` pointing to `<your-github-username>.github.io`.
4. In **Settings → Pages**, enter `mukhxadnahunna.com` as the custom domain. Once the certificate is issued, turn on
   **Enforce HTTPS**.

The repository links used in the site are set at the top of `docs/.vitepress/config.mts`.
