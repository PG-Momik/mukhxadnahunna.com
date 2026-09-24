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

The landing page hero plays two recordings of the demo apps in `../demo`, one after the other: a course review
being blocked, then a reply being censored. Tabs under the video show which is playing and switch between them.

To replace them:

1. Record the demos (see `demo/README.md`).
2. Save the recordings in this folder as `comment-blocked.mov` and `comment-censored.mov`. Raw `.mov` files here are
   git-ignored.
3. Run `./scripts/encode-hero-videos.sh`. It writes an MP4, a WebM and a poster image for each into
   `docs/.vitepress/theme/media/`, holding the last frame for 1.5 seconds so the result can be read. The landing
   page imports them from there, so each build gives them content-hashed file names and a new recording always
   gets a new URL.

The labels and captions are in `HERO_VIDEOS` at the top of `docs/.vitepress/theme/components/Landing.vue`. Visitors
who have reduced motion turned on get paused videos with controls instead of autoplay.

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
