// Snaglist to GitHub issues, as a Cloudflare Worker. Settings: GITHUB_TOKEN (secret), GITHUB_REPO, ALLOWED_ORIGIN.
// The token stays here; the browser never sees it. See docs/topics/send-reports-to-your-own-server.md.
//
// The Origin check stops other websites, not people: anyone can send a request with any Origin. So add a rate
// limit (the LIMITER binding below, or a rate limiting rule for the worker's address) before you make it public.
// Optional binding: LIMITER, a Workers rate limit, for example 5 reports a minute for each address.

const KINDS = /^[a-z0-9-]{1,30}$/;
const MAX = 20000;
// Text from the browser must never notify anyone on GitHub: an invisible space after @ stops a mention.
const noMentions = (text) => text.replace(/@(?=[A-Za-z0-9-])/g, "@\u200b");

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST" || request.headers.get("Origin") !== env.ALLOWED_ORIGIN) {
      return new Response("Not allowed", { status: 403, headers: cors });
    }
    if (Number(request.headers.get("Content-Length") || 0) > MAX) return new Response("Too long", { status: 413, headers: cors });
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") || "unknown" });
      if (!success) return new Response("Too many reports: try again in a minute", { status: 429, headers: cors });
    }
    const text = await request.text();
    if (text.length > MAX) return new Response("Too long", { status: 413, headers: cors });

    let body;
    try { body = JSON.parse(text); } catch { return new Response("Not JSON", { status: 400, headers: cors }); }
    const report = body.report || {};
    const title = noMentions(String(body.title || "UX report").slice(0, 120));
    const labels = ["ux-report"];
    if (KINDS.test(report.type || "")) labels.push(`type: ${report.type}`);
    if (KINDS.test(report.category || "")) labels.push(`kind: ${report.category}`);
    if (KINDS.test(report.severity || "")) labels.push(`severity: ${report.severity}`);

    const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "snaglist-worker",
      },
      body: JSON.stringify({ title, body: noMentions(String(body.markdown || "").slice(0, 60000)), labels }),
    });
    if (!res.ok) return new Response("GitHub did not accept it", { status: 502, headers: cors });
    const issue = await res.json();
    return Response.json({ url: issue.html_url }, { headers: cors });
  },
};
