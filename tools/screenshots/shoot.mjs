// Takes the screenshots for the README and help from the demo and set-up pages. Run by tools/screenshots.sh.
import { chromium } from "playwright";

const BASE = process.env.BASE;
const OUT = process.env.OUT;
const browser = await chromium.launch();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1, reducedMotion: "reduce", ...options });
  const p = await context.newPage();
  await p.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await p.evaluate(() => sessionStorage.clear());
  return p;
}
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png` });
const button = (p, text) => p.locator("snag-list .sl-btn", { hasText: text }).first();
const choose = async (p, type, show) => {
  await p.locator(`snag-list input[name=type][value=${type}]`).check();
  if (show) await p.locator(`snag-list input[name=show][value=${show}]`).check();
  await button(p, "Continue").click();
};

// 1. The demo page with the Send feedback button.
let p = await page();
await shot(p, "demo-page");

// 2. What would you like to send.
await button(p, "Send feedback").click();
await wait(200);
await shot(p, "choose");

// 3. Choosing one thing on the page.
await choose(p, "visual", "one");
await p.hover(".faint");
await wait(200);
await shot(p, "pick");

// 4. The form for one thing, and 5. what is sent.
await p.click(".faint");
await p.locator("snag-list textarea").first().fill("This line is too faint to read on a bright screen.");
await wait(100);
await shot(p, "form-one-thing");
await button(p, "Review what is sent").click();
await wait(200);
await shot(p, "review");
await p.context().close();

// 6. Recording a series of steps, and 7. the form afterwards.
p = await page();
await button(p, "Send feedback").click();
await choose(p, "bug", "steps");
await wait(100);
await shot(p, "recorder-ready");
await button(p, "Start recording").click();
await p.click(".app__bar nav a");
await p.fill("#d-name", "Alex");
await p.locator("#d-name").blur();
await p.click("#fails");
await wait(400);
await p.click("#broken").catch(() => {});
await wait(200);
await shot(p, "recorder-recording");
await button(p, "Stop and describe").click();
await p.locator("snag-list textarea").first().fill("The list says it did not load, and then nothing happens.");
await p.locator("snag-list details summary").click();
await wait(100);
await shot(p, "form-steps");
await p.context().close();

// 8. A suggestion.
p = await page();
await button(p, "Send feedback").click();
await choose(p, "feature", "none");
await p.locator("snag-list textarea").first().fill("Sort my books by narrator.");
await p.locator("snag-list textarea").nth(1).fill("I choose what to listen to by who reads it.");
await wait(100);
await shot(p, "form-suggestion");
await p.context().close();

// 9. On a phone, in dark mode.
p = await page({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark", isMobile: true, hasTouch: true });
await button(p, "Send feedback").click();
await wait(200);
await shot(p, "phone-choose");
await p.context().close();

// 10. The accessibility check on the demo.
p = await page();
await button(p, "Send feedback").click();
await p.locator("snag-list input[name=type][value=check]").check();
await button(p, "Continue").click();
await p.locator("snag-list .sl-result summary").first().waitFor();
await p.locator("snag-list .sl-result summary").first().click();
await wait(200);
await shot(p, "check-results");
await p.context().close();

// 11. The demo's Display and accessibility settings, in dark with large text.
p = await page();
await p.check("input[name=pg-theme][value=dark]");
await p.selectOption("#pg-text", "125");
await p.evaluate(() => scrollTo(0, 0));
await wait(300);
await shot(p, "demo-dark-large-text");
await p.evaluate(() => localStorage.clear());
await p.context().close();

// 12. The set-up tool.
p = await page();
await p.goto(`${BASE}/configure.html`, { waitUntil: "networkidle" });
await p.fill("#c-app", "Harbour Library");
await p.fill("#c-repo", "example-org/harbour-library");
await p.selectOption("#c-platform", "react");
await p.evaluate(() => { document.activeElement.blur(); scrollTo(0, 0); });
await wait(200);
await shot(p, "set-up-tool");
await p.context().close();

// 13. What is sent, on a computer that is offline: Show as a QR code comes first. 14. The QR code view.
p = await page();
await button(p, "Send feedback").click();
await choose(p, "bug", "none");
await p.locator("snag-list textarea").first().fill("The save button does nothing on the last step.");
await p.context().setOffline(true);
await button(p, "Review what is sent").click();
await wait(200);
await shot(p, "review-offline");
await button(p, "Show as a QR code").click();
await wait(200);
await shot(p, "qr-code");
await p.context().close();

// 15. The QR code view on a phone-sized window, in dark mode.
p = await page({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark", isMobile: true, hasTouch: true });
await p.check("input[name=pg-theme][value=dark]");
await button(p, "Send feedback").click();
await choose(p, "ux", "none");
await p.locator("snag-list textarea").first().fill("I could not find where to change my password.");
await button(p, "Review what is sent").click();
await button(p, "Show as a QR code").click();
await wait(200);
await shot(p, "qr-code-dark");
await p.evaluate(() => localStorage.clear());
await p.context().close();

await browser.close();
console.log("done");
