"use client";

/**
 * Triggers the global navigation loading spinner programmatically.
 * @param message Optional custom loading message to display.
 */
export const startNavigationLoading = (message?: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("trigger-nav-loading", { 
      detail: { message } 
    });
    window.dispatchEvent(event);
  }
};