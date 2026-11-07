[Help centre](../README.md) · Reports

# Send reports to GitHub

How-to

Reports open as a new GitHub issue with the title, report and labels filled in. The person reporting posts it
from their own GitHub account, so no key is ever put in your page.

## Before you begin

- A GitHub repository for the reports. It can be your app's own repository or one only for reports.

## Steps

1. Set the repository:

   ```js
   Snaglist.start({ send: { github: { repo: "owner/repo", labels: ["web"] } } });
   ```

   With the script tag only, use `data-github="owner/repo"`.
2. Create the labels in the repository, so GitHub can add them. This command makes the main one with the
   GitHub command-line tool; the [set-up tool](use-the-set-up-tool.md) lists the rest:

   ```bash
   gh label create feedback --repo owner/repo --description "Sent with Snaglist"
   ```

3. Make a test report and select **Open in GitHub**. Check the issue that opens.

## Things to note

- Each report asks for the labels `feedback`, `problem` or `suggestion`, `type: <type>`, and
  `severity: <how bad>` or `importance: <how much it would help>`, plus your own. The
  [set-up tool](use-the-set-up-tool.md) gives the commands to make them all. GitHub
  only adds labels that exist, and only when the person may label issues. The kind and severity are always in
  the report too.
- **Show as a QR code** is offered with **Open in GitHub**, for a computer that is not online: a phone scans
  it and opens the same issue. To leave it out, set `send: { github: { repo: "owner/repo" }, qr: false }`.
  Read [Send a report with a QR code](send-a-report-with-a-qr-code.md).
- The people reporting need a GitHub account. For reports from anyone, read
  [Send reports to your own server](send-reports-to-your-own-server.md).
- Very long reports do not fit in a web address. Snaglist then puts the report on the clipboard and says so.

## Find out more

- [Triage reports on GitHub](triage-reports-on-github.md)
- [Post a report on GitHub](post-a-report-on-github.md), the help for people reporting
