[Help centre](../README.md) · Send reports · How-to

# Send reports to GitHub

Reports open as a new GitHub issue with the title, report and labels filled in. The person reporting posts it
from their own GitHub account, so no key is ever put in your page.

## Before you begin

- A GitHub repository for the reports. It can be your app's own repository or one just for reports.

## Steps

1. Set the repository:

   ```js
   Snaglist.start({ send: { github: { repo: "owner/repo", labels: ["web"] } } });
   ```

   With the script tag only, use `data-github="owner/repo"`.
2. Create the labels in the repository, so GitHub can add them. This command makes the main one with the
   GitHub command-line tool:

   ```bash
   gh label create ux-report --repo owner/repo --description "Sent with Snaglist"
   ```

3. Make a test report and select **Open in GitHub**. Check the issue that opens.

## Things to note

- Each report asks for the labels `ux-report`, `kind: <kind>` and `severity: <how bad>`, plus your own. GitHub
  only adds labels that exist, and only when the person may label issues. The kind and severity are always in
  the report too.
- The people reporting need a GitHub account. For reports from anyone, read
  [Send reports to your own server](send-reports-to-your-own-server.md).
- Very long reports do not fit in a web address. Snaglist then puts the report on the clipboard and says so.

## Find out more

- [Triage reports on GitHub](triage-reports-on-github.md)
- [Post a report on GitHub](post-a-report-on-github.md), the help for people reporting
