[Help centre](../README.md) · Accessibility

# Check a page for accessibility problems

How-to

Run an automatic check of the page you are on. Snaglist lists each problem it finds, shows you where it is,
explains how to fix it, and lets you report one problem or all of them.

## Before you begin

- The site must offer 'Check this page for accessibility problems' under 'Send feedback'. Site owners activate
  it with [Activate the accessibility check](activate-the-accessibility-check.md).

## Steps

1. Go to the page and select **Send feedback**.
2. Under **Check the page**, choose **Check this page for accessibility problems**, then select **Continue**.
   Snaglist checks the page; it takes a moment.
3. Read the list. Each line names a problem, how many times it was found, and the WCAG criterion it breaks.

   ![The Accessibility check window says 7 problems found, 7 rules, and lists them: Pictures with no text alternative, Buttons and links with no name, Fields with no label, Text with too little contrast, Controls smaller than 24 by 24 pixels, Headings out of order, and Links that do not say where they go. The first is open, showing why it matters, how to fix it with code before and after, and the buttons Show on the page and Report this.](../images/check-results.png)

4. Select a problem to open it. You will find why it matters, how to fix it with example code, and where it is.
5. Select **Show on the page** to close the window and outline the first place it was found.
6. Select **Report this** to report that problem, or **Report all** for one report with every problem.
7. Check the report in **What is sent**, then send it: [Check what is sent, then send it](check-what-is-sent.md).

## Things to note

- Automatic checks find only some problems. Also try the page with a keyboard only, at 200% zoom and with a
  screen reader.
- Each report lists up to 10 places for each problem, by CSS selector, so a developer can find them.
- The check reads the page in your browser. Nothing is sent until you choose to report.

## Find out more

- [Fix common accessibility problems](fix-common-accessibility-problems.md)
- [Find and fix accessibility problems](../guides/find-and-fix-accessibility-problems.md)
