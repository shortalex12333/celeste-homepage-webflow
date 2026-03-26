# Plan: Replace Template Images & Clean Up Stray Assets

## Analysis: Desktop vs Tablet vs Mobile Rendering

### Desktop (>991px)
- **Live HTML prototypes** shown via `<iframe>` in `.iframe-product-wrap` containers
- Static fallback images (`img.iframe-fallback`) are **hidden** (`display: none !important`)
- OC section: 2-column grid with sticky text + scroll-in iframes
- All product visuals are **interactive iframes** from `prototypes/*.html`

### Tablet (768px–991px)
- **Same as desktop**: iframes shown, fallback images still hidden
- CSS at 991px breakpoint only adjusts sizes (benefits images → 200px height, etc.)
- **No iframe→image swap happens at this breakpoint** — iframes still render
- OC section keeps 2-column grid layout

### Mobile (≤767px)
- **Iframes hidden** (`.iframe-product-wrap { display: none !important }`)
- **Static fallback images shown** (`img.iframe-fallback { display: block !important }`)
- OC section: stacks to single column, no sticky behavior
- All service/benefit layouts collapse to single column

### Key Difference Summary
| Feature | Desktop & Tablet (>767px) | Mobile (≤767px) |
|---|---|---|
| Product visuals | Live iframe prototypes | Static fallback images |
| OC section | 2-col sticky scroll | Single column, stacked |
| Benefits grid | Side-by-side items | Stacked, 200px wide images |

---

## Stray / Unused Images to Delete

These files exist in `images/` but are **not referenced** in any HTML or CSS:

### 1. Gemini AI-generated images (8 files) — completely unused
- `Gemini_Generated_Image_4gwbqu4gwbqu4gwb.webp`
- `Gemini_Generated_Image_5bqqt35bqqt35bqq.webp`
- `Gemini_Generated_Image_94ivb094ivb094iv.webp`
- `Gemini_Generated_Image_dc2aeadc2aeadc2a.webp`
- `Gemini_Generated_Image_hjgx3rhjgx3rhjgx.webp`
- `Gemini_Generated_Image_ierz2vierz2vierz.webp`
- `Gemini_Generated_Image_oayes4oayes4oaye.webp`
- `Gemini_Generated_Image_rzzqcqrzzqcqrzzq.webp`

### 2. Unreferenced product/template images
- `Image-12_1Image (12).webp` + `-p-500.webp`, `-p-800.webp`, `-p-1080.webp` (4 files)
- `Image-22_1Image-22.webp` + `Image-22_1Image (22).webp` (2 files)
- `Image-7_1Image (7).png`

### 3. Unreferenced Frame thumbnails
- `Frame-8.png` + `Frame-8-p-130x130q80.png`
- `Frame-6-p-130x130q80.png`
- `Frame-7-p-130x130q80.png`

### 4. Old template SVG icons (not used in index.html)
- `flame-1.svg`
- `person-1.svg`
- `paper-plane-1-1.svg`
- `time-1.svg`
- `arrow-right_1arrow-right.webp`

### 5. Unreferenced superyacht/product PNGs
- `superyacht-aerial-30m-luxury-vessel.webp`
- `superyacht-maintenance-audit-compliance.png`
- `superyacht-pms-unified-search.png`
- `yacht-crew-handover-management.png`
- `yacht-management-document-verification.png`

### 6. PNG duplicates of used .webp files
- `Image-8_1Image (8).png` (webp version is the one actually used)
- `Image-10_1Image (10).png` (webp version is the one actually used)

---

## 401.html Issues

The `401.html` page still has **old gym/fitness template** alt text:
- "Silhouette of a woman doing a Pilates exercise stretch"
- "Muscular man in a sleeveless shirt holding a kettlebell"
- "Profile of a woman wearing a red visor"
- "Female tennis player wearing a visor and wristbands"

It also retains old template social links (LinkedIn, Twitter, Behance) and uses the old Webflow template structure. The alt text should be updated to match the actual CelesteOS screenshot content, and the social links should be removed or updated.

---

## Implementation Steps

1. **Delete all stray/unused images** listed above (~28 files)
2. **Update `401.html`** — fix alt text to describe actual CelesteOS content, remove old social media links
3. **Commit and push** to branch `claude/replace-template-images-JJ4VB`
