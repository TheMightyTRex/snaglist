[Help centre](../README.md) · Reports

# Send reports to your own server

How-to

Send reports straight to a server you run, so people can report without a GitHub account or a mail app. Your
server can store them, or file GitHub issues with a key that never reaches the browser.

## Steps

1. Set the address that takes reports:

```js
Snaglist.start({ send: { endpoint: { url: "https://reports.example/" } } });
```

2. Snaglist posts this JSON to it, without cookies or the page's address:

```json
{
  "title": "book-list: The list does not load",
  "markdown": "**What happened**\nThe list does not load\n\n| | |\n|---|---|\n| Report | Something is broken |\n...",
  "report": { "tool": "snaglist 0.3.2", "type": "bug", "severity": "in-the-way", "answers": { "actual": "..." }, "page": {}, "element": {}, "network": [] }
}
```

3. Make your server accept it. Your server must answer the browser's `OPTIONS` check with
   `Access-Control-Allow-Origin` set to your site, then reply to the `POST` with any 2xx status.
4. Make a test report and select **Send**. Snaglist says "Report sent. Thank you." when your server replies.

## Example: file GitHub issues with a Cloudflare Worker

`examples/github-worker.js` is a complete worker. It checks the request came from your site, limits its size,
and files the issue with labels.

1. Make a fine-grained GitHub token with 'Issues: read and write' on the one repository only.
2. Create the worker, paste in the file, and add three settings:
   - `GITHUB_TOKEN`: the token, as a secret.
   - `GITHUB_REPO`: `owner/repo`.
   - `ALLOWED_ORIGIN`: your site, such as `https://www.example`.
3. Point `send.endpoint.url` at the worker's address.

The same steps work on any server: check the origin, limit the size, rebuild the title and labels from the
report's own fields, and call `POST /repos/{owner}/{repo}/issues` with the token. Do not trust the labels or
the title from the request as they are; they come from the browser.

## Things to note

- A public form attracts spam, and the origin check does not stop it: it stops other websites, but anyone can
  send a request with any origin. Add a rate limit per address before the worker is public. The example uses a
  Workers rate limit called `LIMITER` when you add one (for example 5 reports a minute), or add a rate limiting
  rule for its address. Or only start Snaglist for signed-in users or in test builds.
- The example puts an invisible space after every `@`, so a report can never mention someone on GitHub.
- Store only what the report holds. If you add anything, say so in your privacy notice.

## Find out more

- [Set up Snaglist on your own server](../guides/set-up-snaglist-on-your-own-server.md)
- [What a report holds, and what it never holds](what-a-report-holds.md)
