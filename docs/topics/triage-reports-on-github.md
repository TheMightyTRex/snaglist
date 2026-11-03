[Help centre](../README.md) · Reports

# Triage reports on GitHub

How-to

Reports arrive as issues with labels for the kind and how bad it is. Sort them, find the part of the page each
one is about, and close them as you fix them.

## Steps

1. In the repository, go to **Issues** and filter by the label `ux-report`.
2. Sort the worst first by filtering on a severity label, such as `severity: stops-me`, or by report type,
   such as `type: bug`.
3. Open a report. The table gives the page path, the component and a CSS selector.
4. Go to that page, open the browser's developer console and find the part with its selector:

   ```js
   document.querySelector("#books > div > p.faint")
   ```

5. Match the report's window size, theme and text size from the **Window** and **Display** rows to match what
   the person had.
6. Use the technical sections under the table:
   - **Script errors**, **Console** and **Failed and slow requests** point to the code that failed.
   - **Before this** lists what the person did, in order: repeat it to reproduce the problem.
   - **Layout** says what covers the part or cuts it off; **Styles** gives the contrast ratio.
   - **Accessibility** gives the role, name, states and target size a screen reader or keyboard user meets.
   - **Page speed** compares LCP, CLS and INP with Google's good and poor thresholds.
7. Fix it, then close the issue with a link to the change.

## Things to note

- A selector can stop matching after the page changes. The component and the part's label still say what it
  was.
- Duplicates are common in test sessions. Close one with "Duplicate of #12" and GitHub links them.

## Find out more

- [Choose the kinds of issue and how bad they can be](choose-the-kinds-of-issue.md)
- [Run a test session with Snaglist](../guides/run-a-test-session.md)
