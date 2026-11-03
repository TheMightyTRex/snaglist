[Help centre](../README.md) · Guides

# Run a test session with Snaglist

For teams testing a new release or design with testers. At the end, every tester's issues are in GitHub,
tagged by page and component, sorted by how bad they are. Allow 30 minutes to set up, then the session itself.

## Before you begin

- Snaglist is on your site: [Add Snaglist to your site and get your first report](add-snaglist-to-your-site.md).
- A test build or staging site the testers can open.

## The steps at a glance

1. Turn Snaglist on for the test build only
2. Record more for the session
3. Choose the kinds of issue for the session
4. Brief the testers
5. Triage the reports
6. Turn the extra recording off

```mermaid
flowchart TD
  A[Turn on for the test build] --> B[Record more]
  B --> C[Choose the kinds of issue]
  C --> D[Brief the testers]
  D --> E[Triage the reports]
  E --> F[Turn extra recording off]
```

## Step 1: turn Snaglist on for the test build only

Follow [Turn Snaglist on or off for everyone](../topics/turn-snaglist-on-or-off-for-everyone.md) and set
`enabled` from your build or a feature flag.

## Step 2: record more for the session

Turn on `styles`, `errors` and `trail` for the session: [Choose what a report records](../topics/choose-what-a-report-records.md).
Check your error messages hold no personal details first.

## Step 3: choose the kinds of issue for the session

Use `"heuristics"` for a usability review, `"wcag"` for an accessibility check, or your own list:
[Choose the kinds of issue and how bad they can be](../topics/choose-the-kinds-of-issue.md).

## Step 4: brief the testers

Send them [Report issues on a site that uses Snaglist](report-issues-on-a-site.md), the address of the test
build, and what to try. Ask for one report per problem.

## Step 5: triage the reports

Sort, reproduce and close: [Triage reports on GitHub](../topics/triage-reports-on-github.md).

## Step 6: turn the extra recording off

Set `styles`, `errors` and `trail` back to off, or turn Snaglist off, before the release goes live.

## What next

- [Remove Snaglist](../topics/remove-snaglist.md) if you only needed it for this release.
