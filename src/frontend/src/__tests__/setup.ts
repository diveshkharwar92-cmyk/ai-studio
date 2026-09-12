import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement matchMedia, which next-themes and other responsive
// UI libraries rely on.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom does not implement scrollTo on elements.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom does not implement ResizeObserver, which recharts' ResponsiveContainer
// and ChartContainer rely on for measuring chart dimensions.
if (!("ResizeObserver" in window)) {
  class ResizeObserverMock implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (
    window as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
