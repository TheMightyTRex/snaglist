[Help centre](../README.md) · Send reports · How-to

# Triage reports on GitHub

Reports arrive as issues with labels for the kind and how bad it is. Sort them, find the part of the page each
one is about, and close them as you fix them.

## Steps

1. In the repository, go to **Issues** and filter by the label `ux-report`.
2. Sort the worst first by filtering on a severity label, such as `severity: stops-me`.
3. Open a report. The table gives the page path, the component and a CSS selector.
4. Go to that page, open the browser's developer console and find the part with its selector:

   ```js
   document.querySelector("#books > div > p.faint")
   ```

5. Match the report's screen size, theme and text size from the **Screen** and **Display** rows to see what
   the person saw.
6. Fix it, then close the issue with a link to the change.

## Things to note

- A selector can stop matching after the page changes. The component and the part's label still say what it
  was.
- Duplicates are common in test sessions. Close one with "Duplicate of #12" and GitHub links them.

## Find out more

- [Choose the kinds of issue and how bad they can be](choose-the-kinds-of-issue.md)
- [Run a test session with Snaglist](../guides/run-a-test-session.md)
