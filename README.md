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
