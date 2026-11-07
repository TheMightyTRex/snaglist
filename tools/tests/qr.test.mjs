// Tests for Show as a QR code. Each ID is listed in docs/SECURITY-AND-TESTS.md with what it protects.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { open, reviewFor, test, expect, done } from "./harness.mjs";

const fixtures = JSON.parse(readFileSync(new URL("./qr-fixtures.json", import.meta.url), "utf8"));
const GITHUB = { send: { github: { repo: "acme/site" }, copy: true, download: true } };
const button = (page, name) => page.locator("snag-list button", { hasText: new RegExp(`^${name}$`) });
const qrView = async (page) => {
  await button(page, "Show as a QR code").click();
  const view = page.locator("snag-list dialog.sl-dialog--qr");
  await view.waitFor();
  return { view, link: await view.locator("pre.sl-qr-link").textContent(), holds: await view.locator("p.sl-muted").textContent() };
};

await test("QR-01", "the encoder draws the same codes as the design system's terminal/qr.py", async () => {
  const page = await open("<p>Hello</p>");
  for (const f of fixtures) {
    const code = await page.evaluate((text) => Snaglist.qr(text), f.text);
    const bits = code.modules.map((row) => row.map((d) => (d ? "1" : "0")).join("")).join("\n");
    const got = { version: code.version, level: code.level, mask: code.mask, sha256: createHash("sha256").update(bits).digest("hex") };
    for (const k of ["version", "level", "mask", "sha256"])
      expect(got[k] === f[k], `${new TextEncoder().encode(f.text).length} bytes: ${k} is ${got[k]}, the design system has ${f[k]}`);
  }
  expect(await page.evaluate(() => Snaglist.qr("x".repeat(3000))) === null, "text too long for any version should give null");
});

await test("QR-02", "the code holds the same address as Open in GitHub, drawn dark on light with a quiet zone and a description", async () => {
  const page = await open(`<button class="save">Save</button>`, GITHUB);
  await page.evaluate(() => { window.opened = []; window.open = (u) => { window.opened.push(u); return {}; }; });
  await reviewFor(page, ".save", "bug", "Nothing happens.");
  await button(page, "Open in GitHub").click();
  const github = await page.evaluate(() => window.opened[0]);
  await page.evaluate(() => Snaglist.report(document.querySelector(".save"), "bug"));
  await page.locator("snag-list textarea").first().fill("Nothing happens.");
  await button(page, "Review what is sent").click();
  const { view, link, holds } = await qrView(page);
  const params = (u) => { const q = new URL(u); return JSON.stringify([q.origin + q.pathname, ...["labels", "body"].map((k) => q.searchParams.get(k))]); };
  expect(params(link) === params(github), `the link differs from GitHub's:\n${link}\n${github}`);
  expect(holds.includes("whole report"), `a short report should be whole: ${holds}`);
  const svg = await view.locator("svg.sl-qr").evaluate((s) => ({ box: s.getAttribute("viewBox"), role: s.getAttribute("role"), label: s.getAttribute("aria-label"),
    light: s.querySelector("rect").getAttribute("fill"), dark: s.querySelector("path").getAttribute("fill"), width: s.getBoundingClientRect().width,
    d: s.querySelector("path").getAttribute("d") }));
  const code = await page.evaluate((u) => Snaglist.qr(u), link);
  expect(svg.box === `0 0 ${code.size + 8} ${code.size + 8}`, `no 4-module quiet zone: ${svg.box} for ${code.size} modules`);
  expect(svg.role === "img" && /QR code for the link below\. It holds/.test(svg.label), `no text description: ${JSON.stringify(svg)}`);
  expect(svg.light === "#fff" && svg.dark === "#000", `not dark on light: ${svg.light}, ${svg.dark}`);
  expect(svg.width / (code.size + 8) >= 2.5, `modules are too small to scan: ${svg.width} px for ${code.size + 8}`);
  const first = code.modules[0].findIndex(Boolean);
  expect(svg.d.startsWith(`M${first + 4} 4h`), `the drawing does not match the code: ${svg.d.slice(0, 40)}`);
});

await test("QR-03", "offline, Show as a QR code comes first and says why", async () => {
  const page = await open(`<p class="x">Hello</p>`, GITHUB);
  await page.context().setOffline(true);
  await reviewFor(page, ".x", "bug", "It broke.");
  const first = page.locator("snag-list .sl-foot button").first();
  expect((await first.textContent()) === "Show as a QR code", `the first choice is ${await first.textContent()}`);
  expect((await first.getAttribute("class")).includes("sl-btn--primary"), "the QR choice is not the main button");
  const note = await page.locator("snag-list .sl-offline").textContent();
  expect(note === "This computer looks offline: scan it with your phone instead.", `the reason is missing: ${note}`);
  await page.context().setOffline(false);
  const online = await open(`<p class="x">Hello</p>`, GITHUB);
  await reviewFor(online, ".x", "bug", "It broke.");
  expect((await online.locator("snag-list .sl-foot button").first().textContent()) === "Open in GitHub", "online, GitHub should come first");
  expect(await online.locator("snag-list .sl-offline").count() === 0, "online, the offline note should not show");
});

await test("QR-04", "a long report falls back to less, says so, and keeps the link and Download", async () => {
  const page = await open(`<p class="x">Hello</p>`, GITHUB);
  await page.evaluate(() => { for (let i = 0; i < 5; i++) console.error(`Failure ${i}: ${"something went wrong ".repeat(20)}`); });
  await reviewFor(page, ".x", "bug", "It broke when I saved the form.");
  const { view, link, holds } = await qrView(page);
  expect(link.length <= 1200, `the address is ${link.length} characters, more than a code holds`);
  expect(/without its technical details/.test(holds) && /Download keeps the whole report/.test(holds), `the view does not say what the code holds: ${holds}`);
  expect(!link.includes("Failure"), "the technical details should be left out");
  expect(await view.locator("button", { hasText: /^Download$/ }).count() === 1, "no Download in the QR view");
  expect(await view.locator("button", { hasText: /^Copy the link$/ }).count() === 1, "no Copy button for the link");
  // Words too long even for the report without its details: a short report, cut to fit.
  const long = await open(`<p class="x">Hello</p>`, GITHUB);
  await reviewFor(long, ".x", "bug", "Every word here matters a great deal to me. ".repeat(60));
  const short = await qrView(long);
  expect(short.link.length <= 1200 && /a short report/.test(short.holds), `no short report: ${short.holds} (${short.link.length})`);
  expect(short.link.includes("%E2%80%A6"), "the person's words should be cut, with an ellipsis");
});

await test("QR-05", "the QR view works from the keyboard and is dark on light in every theme", async () => {
  for (const [theme, scheme] of [["light", "light"], ["dark", "light"], ["auto", "light"], ["auto", "dark"]]) {
    const page = await open(`<p class="x">Hello</p>`, { ...GITHUB, theme });
    await page.emulateMedia({ colorScheme: scheme });
    await reviewFor(page, ".x", "bug", "It broke.");
    await button(page, "Show as a QR code").focus();
    await page.keyboard.press("Enter");
    await page.locator("snag-list dialog.sl-dialog--qr").waitFor();
    const focused = () => page.evaluate(() => { const a = document.querySelector("snag-list").shadowRoot.activeElement; return a && (a.textContent || a.className); });
    expect((await focused()) === "Copy the link", `${theme}/${scheme}: focus is on ${await focused()}`);
    await page.keyboard.press("Shift+Tab");
    expect(/sl-qr-link/.test(await page.evaluate(() => document.querySelector("snag-list").shadowRoot.activeElement.className)), `${theme}/${scheme}: the link cannot be reached with Tab`);
    const colours = await page.locator("snag-list svg.sl-qr").evaluate((s) => ({ bg: getComputedStyle(s).backgroundColor, rect: getComputedStyle(s.querySelector("rect")).fill, path: getComputedStyle(s.querySelector("path")).fill }));
    expect(colours.bg === "rgb(255, 255, 255)" && colours.rect === "rgb(255, 255, 255)" && colours.path === "rgb(0, 0, 0)", `${theme}/${scheme}: ${JSON.stringify(colours)}`);
    await page.keyboard.press("Escape");
    expect((await focused()) === "Show as a QR code", `${theme}/${scheme}: focus did not go back to the QR choice`);
  }
});

await test("SEC-20", "the QR code holds nothing typed into the page, and no email address or key", async () => {
  const page = await open(`<form class="f"><label for="p">Password</label><input id="p" type="password"><label for="n">Name</label><input id="n"></form>`, GITHUB);
  await page.fill("#p", "hunter2-very-secret");
  await page.fill("#n", "Jo Bloggs");
  await reviewFor(page, ".f", "bug", "Mail me at jo@example.org, my key is ghp_abcdefghijklmnop1234");
  const { link } = await qrView(page);
  const text = decodeURIComponent(link);
  for (const leak of ["hunter2", "Jo Bloggs", "jo@example.org", "ghp_abcdefghijklmnop1234"]) expect(!text.includes(leak), `"${leak}" is in the QR code's address`);
});

await done();
