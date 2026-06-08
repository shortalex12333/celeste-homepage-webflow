# RECOVERY BACKLOG

This backlog breaks down the catastrophic execution failures into atomic, testable engineering tasks. No code will be written until this architecture is validated.

## EPIC 1: Physics Engine & Stack Initialization
**Issue:** The animations feel cheap ("rubber band") because they rely on native browser scroll physics and default GSAP easings.
- [ ] **TASK 1.1:** Inject the `Lenis` smooth-scroll library into the `<head>` or early `<script>` block.
- [ ] **TASK 1.2:** Initialize Lenis with `{ duration: 1.2, smooth: true }` and bind it to `gsap.ticker`.
- [ ] **TASK 1.3:** Inject `CustomEase` and register the `apple` curve (`M0,0 C0.25,0.1 0.25,1 1,1`).
- [ ] **TASK 1.4:** Execute a global find-and-replace on all timeline definitions to swap `power2.in`, `power2.out`, and `power2.inOut` with `"apple"`.

## EPIC 2: Z-Index & Layering Architecture
**Issue:** The WebGL background, the static DOM sections, and the pinned `100vh` scroll tracks are fighting for Z-space, causing clipping and invisible text.
- [ ] **TASK 2.1:** Standardize the DOM z-indexes.
    - WebGL Canvas: `z-index: -1`
    - Standard Sections: `z-index: 10`
    - Pinned Viewports: `z-index: 20`
- [ ] **TASK 2.2:** Ensure all parent containers of `.search-viewport` and `.wormhole-viewport` do not have `overflow: hidden` applied globally, which breaks `position: sticky`.

## EPIC 3: Proportional Anchoring & Stickiness (Moment 1 & 2)
**Issue:** Sloppy inline styles (`margin-left: calc(-50vw + 50%)`) broke the fluid layout constraints, causing horizontal scrolling and poor centering.
- [ ] **TASK 3.1 (Search Unveil):** Remove the hacky inline styles. Re-wrap the Search Bar in a clean Webflow `.w-container` equivalent wrapper. Center it using flexbox. Calculate its scale mathematically based on a maximum width constraint (e.g., `800px`), not a raw multiplier.
- [ ] **TASK 3.2 (Wormhole Math):** Implement the true 60% viewport calculation (`(window.innerWidth * 0.6) / linkWidth`). 
- [ ] **TASK 3.3 (Wormhole Act Structure):** Refactor the GSAP timeline strictly into thirds: 0-30% (Push), 30-70% (Absolute Hold with zero movement), 70-100% (Slide Left & Reveal).

## EPIC 4: Media Framing & Dimensions (Moment 3)
**Issue:** Media looks weak and cropped arbitrarily. Taking elements out of their wrappers destroyed their aspect ratios.
- [ ] **TASK 4.1 (Suggested Docs):** The prototype `suggested-docs-tab.html` must be placed inside a container with a strict aspect ratio or fixed height that displays the *entire* relevant interaction (the header, the question, the buttons). No negative margins.
- [ ] **TASK 4.2 (Warranty Flag):** The `warranty-money-finder-nofig.html` must be scaled down cleanly using CSS `transform` on the wrapper if it doesn't fit mobile screens, rather than cropping the iframe.

## EPIC 5: Environmental Lighting (Volumetric Glow)
**Issue:** The Three.js glow is either bleeding into the wrong sections or failing to track the scroll properly.
- [ ] **TASK 5.1:** Bind the WebGL shader coordinates explicitly to the center of the viewport.
- [ ] **TASK 5.2:** Use ScrollTrigger `onEnter` and `onLeave` callbacks on the exact target `div` IDs to manipulate the `u_opacity` and `u_color` uniforms, ensuring the light only emits when the focal media is on screen.