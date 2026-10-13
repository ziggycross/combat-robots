# Vancouver Combat Robots — site

Astro static site. Content (events, sponsors, gallery, about text) is pulled
from Sanity **at build time** via `src/lib/sanity.js`, then rendered to plain
static HTML — no client-side fetch, so pages load fast and are fully
cacheable.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321, fetches live content from Sanity
npm run build    # outputs static site to dist/
npm run preview  # serve the built dist/ locally
```

## How content updates reach the live site

The site is **not** rebuilt on every single Sanity edit. Instead:

1. Editing/publishing in Sanity Studio fires a webhook (configured in Sanity,
   see below) that pings GitHub.
2. GitHub Actions ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml))
   waits 5 minutes (debounce — so a burst of edits only triggers one build),
   then rebuilds the site with the latest content and force-pushes a single
   commit to the `gh-pages` branch.
3. GitHub Pages serves `gh-pages`. No history piles up there — every deploy
   replaces the previous commit entirely (`force_orphan: true`).

Pushing code changes to `main` (anything under `web/`) also triggers an
immediate rebuild (no debounce — that's a deliberate change, not a flurry of
CMS edits).

### One-time setup: Sanity webhook

In [sanity.io/manage](https://sanity.io/manage) → your project → **API** →
**Webhooks** → **Create webhook**:

| Field | Value |
|---|---|
| Name | `Deploy site` |
| URL | `https://api.github.com/repos/<owner>/<repo>/dispatches` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| HTTP method | `POST` |
| HTTP Headers | `Authorization: Bearer <GITHUB_PAT>`<br>`Accept: application/vnd.github+json` |
| Payload | Custom body: `{"event_type": "sanity-publish"}` |

`<GITHUB_PAT>` needs a fine-grained GitHub token scoped to this repo with
**Contents: Read and write** (that's what `repository_dispatch` requires).
Generate one at GitHub → Settings → Developer settings → Fine-grained tokens.

### One-time setup: GitHub Pages

Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → branch
`gh-pages` / `root`. Custom domain `combatrobots.ca` stays set — the CNAME
file lives at `public/CNAME` and is included in every build, so it survives
the orphan force-push.

### Tuning the debounce window

Edit the `sleep 300` line in `.github/workflows/deploy.yml` (seconds). Longer
= fewer wasted Actions minutes during busy editing sessions, but a longer
delay before publishes go live.
