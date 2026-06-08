# How to Hold the Line (The Founder's Review Protocol)

As Technical Director, when receiving a PR from the contract engineering team, you must not look at the code first. Pull the branch locally and run this physical stress test to ensure compliance with the `$100M Infrastructure Guardrails`:

### 1. The CPU Throttle Test
Open Chrome DevTools, navigate to the Performance tab, and throttle the CPU to **4x slowdown**. Scroll the page up and down. 
*   **The Pass:** The animation maintains a fluid, hardware-accelerated glide.
*   **The Fail:** If the animation stutters, they are causing layout reflows (animating banned properties like `font-size` or `height`) or their WebGL shader math is too heavy for the GPU to process in time. **Reject it.**

### 2. The Ultrawide Break Test
Drag your browser window from a standard 14-inch laptop width to an ultrawide monitor width while halfway through the "Wormhole" animation. 
*   **The Pass:** The animation pauses for ~200ms, the canvas recalculates silently, and the focal text remains perfectly centered at exactly 60% of the viewport width.
*   **The Fail:** If the focal text drifts off-center, blows past the edges of the screen, or the camera lock breaks entirely, their bounding-box math is hardcoded instead of utilizing a dynamic, debounced `ResizeObserver`. **Reject it.**

### 3. The VoiceOver Test
Turn on macOS VoiceOver (or Windows Narrator). Close your eyes and tab through the page.
*   **The Pass:** The screen reader seamlessly reads the HTML content (e.g., the Work Order title, the handover notes) exactly as they appear visually in the WebGL canvas.
*   **The Fail:** If you cannot understand the purpose of the platform through the screen reader alone, or if the WebGL canvas acts as a silent black box, the Ghost DOM is failing or missing. **Reject it.**