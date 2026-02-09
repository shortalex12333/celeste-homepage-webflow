# Celeste Homepage (Webflow Export)

Static site exported from Webflow.

## Local preview
Open `index.html` in a browser or serve locally:

```sh
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Deploy (Vercel)
This repo is ready for a static deploy on Vercel.
- Framework preset: Other
- Build command: (leave empty)
- Output directory: /

Notes:
- Webflow CMS/E‑commerce/Search and native Webflow forms are not included in code exports. If you need forms, connect a provider (Formspree/Basin) or add a Vercel serverless function.
- `404.html` and `401.html` are included and will be served automatically.
