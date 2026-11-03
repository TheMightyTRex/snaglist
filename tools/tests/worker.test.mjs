// Tests for the example worker in examples/github-worker.js, with GitHub replaced by a stand-in.
import worker from "/repo/examples/github-worker.js";
import { test, expect, done } from "./harness.mjs";

const env = { GITHUB_TOKEN: "test-token", GITHUB_REPO: "owner/repo", ALLOWED_ORIGIN: "https://site.example" };
let sent = null;
globalThis.fetch = async (url, init) => { sent = { url, ...init, json: JSON.parse(init.body) }; return Response.json({ html_url: "https://github.com/owner/repo/issues/1" }); };
const post = (body, headers = {}) => new Request("https://worker.example/", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body),
  headers: { Origin: env.ALLOWED_ORIGIN, "Content-Type": "application/json", ...headers } });

await test("SEC-13", "the example worker files a report, and refuses other sites", async () => {
  const ok = await worker.fetch(post({ title: "T", markdown: "M", report: { type: "bug" } }), env);
  expect(ok.status === 200 && sent.json.labels.includes("type: bug"), `status ${ok.status}`);
  const other = await worker.fetch(post({ title: "T" }, { Origin: "https://evil.example" }), env);
  expect(other.status === 403, `another site got ${other.status}`);
});

await test("SEC-14", "the example worker cannot be used to mention people on GitHub", async () => {
  sent = null;
  await worker.fetch(post({ title: "Hi @octocat", markdown: "ping @octocat and @github/team", report: {} }), env);
  expect(!/@[A-Za-z0-9]/.test(sent.json.title + sent.json.body), `a mention got through: ${sent.json.title} ${sent.json.body}`);
});

await test("SEC-15", "the example worker refuses an oversized request before reading it", async () => {
  let read = false;
  const fake = { method: "POST", headers: new Headers({ Origin: env.ALLOWED_ORIGIN, "Content-Length": "5000000" }),
    text: async () => { read = true; return "{}"; } };
  const big = await worker.fetch(fake, env);
  expect(big.status === 413 && !read, `got ${big.status}, body read: ${read}`);
});

await test("SEC-16", "the example worker uses a rate limit when one is set up", async () => {
  sent = null;
  const limited = await worker.fetch(post({ title: "T" }, { "CF-Connecting-IP": "203.0.113.9" }), { ...env, LIMITER: { limit: async () => ({ success: false }) } });
  expect(limited.status === 429 && sent === null, `got ${limited.status}`);
});

await done();
