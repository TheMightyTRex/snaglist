# Filing GitHub issues from your own server

With `send.github`, the person reporting needs a GitHub account and posts the issue themselves. To take
reports from anyone, send them to your own server, which files the issue with a token that never reaches the
browser.

```js
Snaglist.start({ send: { endpoint: { url: "https://reports.example.com/" } } });
```

Snaglist posts this JSON, without cookies:

```json
{
  "title": "cover-wall: Title wraps badly",
  "markdown": "Title wraps badly\n\n| | |\n|---|---|\n| Kind | Layout |\n...",
  "report": { "tool": "snaglist 0.1.0", "category": "layout", "severity": "in-the-way", "what": "...", "page": {}, "element": {} }
}
```

## Example: a Cloudflare Worker

`examples/github-worker.js` is a complete worker. It checks the request came from your site, limits its size,
and files the issue with labels.

1. Make a fine-grained GitHub token with **Issues: read and write** on the one repository only.
2. Create the worker, paste in the file, and add three settings:
   - `GITHUB_TOKEN`: the token, as a secret.
   - `GITHUB_REPO`: `owner/repo`.
   - `ALLOWED_ORIGIN`: your site, such as `https://example.com`.
3. Point `send.endpoint.url` at the worker's address.

The same steps work on any server: check the origin, limit the size, rebuild the title and labels from the
report's own fields, and call `POST /repos/{owner}/{repo}/issues` with the token. Do not trust the labels or
the title from the request as they are; they come from the browser.

## Spam

A public form attracts spam. Add a rate limit per address on your server, or only start Snaglist for signed-in
users or in test builds.
