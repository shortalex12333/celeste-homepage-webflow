# The CelesteOS Master Pull Request Template

**To the Engineer:** CelesteOS is a high-performance operational environment, not a standard web page. We enforce absolute physical materiality and zero-jank hardware execution. Before submitting this PR, you must verify compliance with the `PHYSICAL_MATERIALITY_PROTOCOL.md`.

### 1. Architecture & Performance Profile
*   **Target Device:** [e.g., iPhone 15 Pro / M3 Max MacBook]
*   **Target FPS:** [Must maintain 60/120fps during active scroll scrub]
*   **VRAM Cap Implemented:** Yes/No (Provide line number for the `Math.min(window.devicePixelRatio, 2)` execution).

### 2. The Hard Constraints Checklist (Binary: Pass/Fail)
- [ ] **The Ethical Kill Switch:** `window.matchMedia('(prefers-reduced-motion: reduce)')` is active. If triggered, GSAP and WebGL are fully aborted, and the vertical CSS fallback is served.
- [ ] **Zero Raster Degradation:** No standard `<img src="...png/jpg">` tags have been introduced. All textures utilize KTX2/Basis compression, or MSDF for typography.
- [ ] **GPU-Only Animation:** GSAP is strictly animating `transform` and `opacity`. There are absolutely zero layout-triggering properties (`font-size`, `width`, `top`, `margin`) being animated on scroll.
- [ ] **The Ghost DOM (Accessibility/SEO):** All WebGL text and data have a 1:1 visually hidden, semantically correct HTML node mirroring its coordinates. Screen readers can parse the entire sequence natively.
- [ ] **Debounced Resize Handling:** `ResizeObserver` is active with a minimum 200ms debounce. Changing the viewport dimensions recalculates the GSAP math and Three.js frustum without breaking the camera lock or causing a memory leak.

### 3. Visual & Material Execution
- [ ] **No Flat Hex Codes:** Linear CSS gradients have been banned. Backgrounds use Volumetric Bloom (radial distance fields/shaders) or physical rim lighting via inset shadows.
- [ ] **Cinematic Pacing:** Scroll mapping respects "The Hold." Animations do not scrub linearly from 0-100%; they push, hold in absolute stillness for readability, and then exit.

### 4. Memory Leak Verification
- [ ] I have verified that `will-change: transform, opacity` is applied cleanly and does not remain perpetually active on off-screen elements.
- [ ] Scrolling to the bottom of the page and violently scrubbing backward to the top does not crash the WebGL canvas or cause state-collision bugs.
