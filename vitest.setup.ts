import { afterEach } from 'vitest';

// Tests must never reach PostHog: a request that slipped past a test's own stubs would land in
// the analytics project. The SDK swallows transport errors, so blocked requests fail the test
// afterwards instead of relying on a throw surfacing. Script tags are not covered because jsdom
// does not load external scripts.
const blocked: string[] = [];

function isPosthogHost(href: string) {
  try {
    return /(^|\.)posthog\.com$/.test(new URL(href, 'http://localhost').hostname);
  } catch {
    return false;
  }
}

function guard(input: unknown) {
  const href = input instanceof Request ? input.url : String(input);
  if (!isPosthogHost(href)) return;
  blocked.push(href);
  throw new Error(`Blocked PostHog request in tests: ${href}`);
}

const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  guard(input);
  return realFetch(input, init);
};

if (typeof XMLHttpRequest !== 'undefined') {
  const open = XMLHttpRequest.prototype.open as (...args: unknown[]) => void;
  XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: unknown[]) {
    guard(args[1]);
    open.apply(this, args);
  };
}

if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
  const sendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    guard(url);
    return sendBeacon(url, data);
  };
}

afterEach(() => {
  if (blocked.length === 0) return;
  const urls = blocked.splice(0).join(', ');
  throw new Error(`Test attempted to reach PostHog: ${urls}`);
});
