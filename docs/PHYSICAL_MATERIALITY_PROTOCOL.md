# Sub-Directive: Physical Materiality & Illumination

CelesteOS is a monolithic, physical architecture. We do not use CSS linear gradients, and we reject all generic SaaS color-blocking. Flat hex codes are forbidden for defining Z-space. 

You must define the UI components as physical materials interacting with photons in Z-space:

1. **Volumetric Bloom over Linear Gradients:** 
   The teal hue exists as an atmospheric fog, dense at the core and fading exponentially into the absolute black of the void. Rendered via WebGL custom Gaussian blurs.

2. **The Fresnel Effect (Edge Lighting):**
   Dark cards on a dark background must apply a microscopic, 1px inner-border (`box-shadow: inset 0 1px 1px rgba(255,255,255,0.1)`) acting as a rim-light to prove the object has physical thickness.

3. **Ambient Occlusion (Micro-Shadows):**
   No massive drop-shadows. Calculate deep, near-black gradients where UI elements physically intersect the Z-plane to simulate natural light blocking.

4. **Monochromatic Thermal Shifts:**
   Hues behave under temperature, not color-mixing. Our brand teal (#5AABCC) highlights shift toward pure, hot, icy cyan (#E0F7FA), while the deep edges desaturate into a heavy, light-absorbing charcoal (#0A1114).

5. **Subsurface Scattering:**
   For translucent glass layers, light must bleed through the material, giving it physical volume rather than flat CSS opacity.

---

# Sub-Directive: The $100M Infrastructure Guardrails

1. **The VRAM Chokehold (Texture & Pixel Management):**
   *   **Cap the DPR:** Hardcode WebGL renderer to never exceed a pixel ratio of 2 (`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`).
   *   **KTX2 Compression:** Ban standard images in WebGL. Force .ktx2 texture formats directly into GPU memory.

2. **The "Ghost Canvas" (DOM Mirroring):**
   Every text/data element rendered in WebGL MUST have a visually hidden (`opacity: 0`, `pointer-events: none`), perfectly structured HTML equivalent (`aria-hidden="false"`) synced via GSAP for SEO and Accessibility.

3. **The Debounced Resize Catastrophe:**
   Do not rely solely on `invalidateOnRefresh`. Implement a Debounced ResizeObserver to pause animation, recalculate camera frustum ratios, and redraw the frame without firing 50 times during a window drag.

4. **The Legal/Ethical Kill Switch:**
   If `window.matchMedia('(prefers-reduced-motion: reduce)')` returns true, do not initialize Lenis, ScrollTrigger, or Three.js. Append a `.reduced-motion` class to `<body>` and gracefully degrade to a vertical, fade-in native scroll.