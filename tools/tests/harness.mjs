// Shared helpers for the tests in this folder. Each test file runs on its own: node security.test.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:18794";
let failures = 0;
const browser = await chromium.launch();

// A fresh test page with the given HTML in <main> and Snaglist started with the given settings.
export async function open(html = "", options = {}, url = "/tools/tests/page.html") {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
  // Nothing may leave the computer: any request to another host is refused and counted.
  page.outside = [];
  await context.route((u) => !u.href.startsWith(BASE), (route) => { page.outside.push(route.request().url()); route.abort(); });
  await page.goto(BASE + url);
  await page.evaluate(([h, o]) => { const main = document.getElementById("main"); if (location.pathname === "/tools/tests/page.html") { main.innerHTML = h; Snaglist.start(o); } }, [html, { send: { copy: true }, ...options }]);
  return page;
}

// The report Snaglist shows in its review window for one part of the page, as Markdown.
export async function reviewFor(page, selector, type = "visual", answer = "It looks wrong.") {
  await page.evaluate(([s, t]) => Snaglist.report(document.querySelector(s), t), [selector, type]);
  const box = page.locator("snag-list textarea").first();
  if (await box.count()) await box.fill(answer);
  await page.locator("snag-list button", { hasText: /^Review what is sent$/ }).click();
  return page.locator("snag-list pre.sl-preview").textContent();
}

export async function test(id, name, fn) {
  try { await fn(); console.log(`PASS ${id} ${name}`); }
  catch (err) { failures++; console.log(`FAIL ${id} ${name}\n  ${String(err.message || err).split("\n").join("\n  ")}`); }
}

export function expect(ok, message) { if (!ok) throw new Error(message); }

export async function done() {
  await browser.close();
  if (failures) { console.log(`${failures} failed`); process.exit(1); }
}
