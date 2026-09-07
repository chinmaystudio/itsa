let hierarchyPreloadStarted = false;

/**
 * Warms the lazy 3D hierarchy chunk (three.js / R3F) ahead of time so
 * opening the 3D view paints in about a frame instead of waiting on the
 * network. Idempotent — repeated calls are no-ops.
 */
export function preloadHierarchy3D(): void {
  if (hierarchyPreloadStarted) return;
  hierarchyPreloadStarted = true;
  void import("@/components/team/hierarchy-3d");
}

/**
 * Schedules the preload for when the browser is idle (after the landing
 * view has rendered and hydrated). SSR-safe; falls back to a timeout.
 */
export function scheduleHierarchy3DPreload(): void {
  if (typeof window === "undefined" || hierarchyPreloadStarted) return;
  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(() => preloadHierarchy3D(), { timeout: 1500 });
  } else {
    window.setTimeout(preloadHierarchy3D, 400);
  }
}
