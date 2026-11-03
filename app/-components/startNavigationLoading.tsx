"use client";

/**
 * Shows the global navigation loader while navigating to the destination.
 */
export const startNavigationLoading = (destinationHref?: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("sgcst:navigation-start", {
      detail: destinationHref,
    });
    window.dispatchEvent(event);
  }
};
