// Tests for messages and the report types renamed in 0.5.0. Each ID is listed in docs/SECURITY-AND-TESTS.md.
import { open, reviewFor, test, expect, done } from "./harness.mjs";

const BASE = process.env.BASE || "http://127.0.0.1:18794";
const button = (page, name) => page.locator("snag-list button", { hasText: new RegExp(`^${name}$`) });

await test("MSG-01", "a report that is not sent says what to do in an alert that stays until it is closed", async () => {
  // The test server refuses a POST, so the report is not sent.
  const page = await open(`<p class="x">Hello</p>`, { send: { endpoint: { url: `${BASE}/tools/tests/page.html` }, copy: true } });
  await reviewFor(page, ".x", "bug", "It broke.");
  const send = button(page, "Send report");
  await send.click();
  const alert = page.locator("snag-list dialog .sl-alert[role=alert]");
  await alert.locator(".sl-notice").waitFor();
  const title = await alert.locator(".sl-notice__title").textContent();
  expect(title === "The report was not sent", `the message is ${title}`);
  const said = await alert.locator(".sl-notice > p").allTextContents();
  expect(said.every((p) => !/\d{3}/.test(p)), `the raw error is in the sentence: ${said.join(" | ")}`);
  expect(/Technical details/.test(await alert.locator("summary").textContent()), "no Technical details");
  expect(/\b50\d\b/.test(await alert.locator("details p").textContent()), "the raw error is not under Technical details");
  await page.waitForTimeout(7000);
  expect(await alert.locator(".sl-notice").count() === 1, "the error went away by itself");
  const close = alert.locator("button");
  expect((await close.getAttribute("aria-label")) === "Close: The report was not sent", `Close is named ${await close.getAttribute("aria-label")}`);
  await close.click();
  expect(await alert.locator(".sl-notice").count() === 0, "Close did not close the error");
  expect(await page.locator("snag-list").evaluate((h) => h.shadowRoot.activeElement?.textContent) === "Send report", "focus did not go back to Send report");
});

await test("MSG-02", "the status region is in the page before the first message, and a message stays while the pointer is on it", async () => {
  const page = await open(`<p class="x">Hello</p>`);
  const region = page.locator("snag-list .sl-status[role=status]");
  expect(await region.count() === 1 && (await region.textContent()) === "", "no empty status region waiting in the page");
  await reviewFor(page, ".x", "bug", "It broke.");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true }));
  await button(page, "Copy as Markdown").click();
  await page.waitForFunction(() => document.querySelector("snag-list").shadowRoot.querySelector(".sl-status").textContent !== "");
  await region.hover();
  await page.waitForTimeout(7000);
  expect((await region.textContent()) !== "", "the message went while the pointer was on it");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(7000);
  expect((await region.textContent()) === "", "the message stayed after the pointer left");
});

await test("TYPE-01", "the old report type ids from before 0.5.0 still work", async () => {
  const page = await open(`<p class="x">Hello</p>`, { types: ["bug", "ux", "visual"], text: { "types.ux.label": "My own label" },
    send: { github: { repo: "acme/site" } } });
  await page.evaluate(() => Snaglist.open("visual"));
  const radios = page.locator("snag-list input[name=type]");
  const values = await radios.evaluateAll((r) => r.map((x) => [x.value, x.checked]));
  expect(JSON.stringify(values.map(([v]) => v)) === JSON.stringify(["bug", "confusing", "display"]), `the types are ${JSON.stringify(values)}`);
  expect(values.find(([v]) => v === "display")[1], "Snaglist.open(\"visual\") did not choose Display problem");
  const names = await page.locator("snag-list .sl-choice__name").allTextContents();
  expect(names.includes("My own label") && names.includes("Display problem"), `the labels are ${names.join(", ")}`);
  const fresh = await open(`<p class="x">Hello</p>`, { types: ["visual"], send: { github: { repo: "acme/site" } } });
  await fresh.evaluate(() => { window.opened = []; window.open = (u) => { window.opened.push(u); return {}; }; });
  await reviewFor(fresh, ".x", "visual", "Overlaps.");
  await button(fresh, "Open in GitHub").click();
  const labels = await fresh.evaluate(() => new URL(window.opened[0]).searchParams.get("labels"));
  expect(labels.split(",").includes("type: display"), `the GitHub labels are ${labels}`);
});

await done();
