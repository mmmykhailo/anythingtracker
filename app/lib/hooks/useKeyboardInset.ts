import { useEffect } from "react";

const CSS_VARIABLE = "--keyboard-inset";

// Browser interfaces sliding in and out also shrink the visual viewport, so
// anything smaller than this is not treated as an on-screen keyboard.
const MIN_KEYBOARD_HEIGHT = 80;

/**
 * Publishes the height of the on-screen keyboard as a global `--keyboard-inset`
 * CSS variable, `0px` while it is closed.
 *
 * The keyboard shrinks the visual viewport but leaves the layout viewport (and
 * therefore `dvh` units and bottom-anchored fixed elements) untouched, so the
 * difference between the two is what the keyboard covers.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;

    const update = () => {
      const covered =
        window.innerHeight - viewport.height - viewport.offsetTop;
      const inset = covered > MIN_KEYBOARD_HEIGHT ? Math.round(covered) : 0;
      root.style.setProperty(CSS_VARIABLE, `${inset}px`);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      root.style.removeProperty(CSS_VARIABLE);
    };
  }, []);
}
