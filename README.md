# cultivo-site

The Cultivo marketing landing page. Live at **https://cultivo.ag**.

This is a static site with no build step. What is in the repo is what ships.

## How this deploys

Vercel project `cultivo-site`, git-connected to this repo. **A merge to `main` deploys production.** Pushing a branch builds a preview at a URL Vercel posts on the pull request.

`main` is protected: no direct pushes, no force pushes, no deletion. Every change lands through a pull request with one approval.

## Working on it

Clone, open the folder, and edit. There is nothing to install and nothing to run. To see it locally:

```bash
python3 -m http.server 4182
```

Then open http://localhost:4182.

Make changes on a branch, open a PR, and check the preview URL Vercel posts before asking for review.

## Files

| File | What it is |
|---|---|
| `index.html` | Page structure and all copy |
| `styles.css` | All styling, including the design tokens in `:root` |
| `app.js` | Interactions (the living facility model, scroll behavior) |
| `assets/fonts/` | Barlow Condensed and Zilla Slab, self-hosted |
| `assets/planner-current-light.jpg` | Current light-mode Planning Overview screenshot, Fig. 2 |
| `assets/cultivo-mark.svg` | The product mark used by the live Cultivo app |
| `assets/cultivo-og.png` | Site-wide social preview |
| `calculator.html` | Standalone Cultivo value calculator |

Colors live as CSS custom properties at the top of `styles.css`. Change them there, not inline, so the whole page moves together.

## Brand rules that are not negotiable

The full system is the `cultivo_brand_system_machine_age` record in the Praxis Brain (ask it for "Cultivo brand system"). The short version:

**The thesis is farm machinery for the information layer of cultivation.** Dependable machinery, not software.

- **Never lead with AI.** Lead with the job. The promise is "the system stays true even when nobody opens it."
- **Type:** Barlow Condensed 700 for display and Zilla Slab 400/700 for body. The Cultivo wordmark follows the app lockup and uses IBM Plex Sans with a system fallback.
- **Palette:** app canvas `#0B1219`, surface `#121D29`, raised surface `#182735`, warm ink `#F4EFE4`, and brass `#C9A24B`. Green `#77A58E`, coral `#D7887E`, and blue `#7DA6B7` are functional accents.
- **Depth:** the full site now lives in the app's dark operating world. Contrast comes from layered navy surfaces, warm ink, fine wire lines, and restrained brass instrumentation.
- **Logo:** use `assets/cultivo-mark.svg` and the CULTIVO lockup. Never substitute the CULT/Cult Ops tenant mark.
- **Cultivo is its own brand.** Praxis appears only as "Built by Praxis" in the footer. CultOps is tenant one's instance name and is never said to prospects.
- **Not:** weed-culture, sci-fi AI chrome, generic SaaS gradients, or the Praxis Bebas editorial look.

## Claims discipline

Customer proof on this page stays anonymous: "a working Arizona facility since 2025." Cult is not named. Do not add a logo, a customer name, or a metric that is not already on the page without checking first.

Pricing is not ratified. Do not put numbers on this page.

## A note on the assets

Fonts and the Fig. 2 screenshot used to be base64 data-URIs inline in `index.html`, which made the file 314KB and painful to edit. They are now real files. That is better for editing and for caching, but it means this page is no longer a single self-contained file you can paste into a Claude artifact. If you need an artifact version, inline them again first.
