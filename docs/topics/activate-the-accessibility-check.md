[Help centre](../README.md) · Accessibility

# Activate the accessibility check

How-to

Offer 'Check this page for accessibility problems' under 'Send feedback', so testers and users can run an
automatic check and report what it finds. It is active by default; this topic says how to choose the engine or turn
it off.

## Steps

1. Keep `"check"` in the list of what people can send. It is in the default list. If you set `types`, add it:

   ```js
   Snaglist.start({ types: ["bug", "ux", "feature", "check"] });
   ```

2. Choose the engine:
   - **Built in** (the default): 13 checks for the most common problems, each with how to fix it and example
     code. Nothing else is loaded.
   - **axe-core**: about 90 rules from Deque's open-source checker, with a link to the fix for each. Snaglist
     loads it from jsDelivr only when someone runs the check.

   ```js
   Snaglist.start({ check: { engine: "axe" } });
   ```

3. To load axe-core from your own server instead, download `axe.min.js` from the axe-core releases, put it with
   your site's files, and point Snaglist at it:

   ```js
   Snaglist.start({ check: { engine: "axe", axe: "/js/axe.min.js" } });
   ```

4. Run the check on your own pages: [Check a page for accessibility problems](check-a-page-for-accessibility-problems.md).

## Things to note

- Reports from the check have the label `accessibility` and the type `check` on GitHub.
- To leave the check out, remove `"check"` from `types`.
- To check many pages without anyone selecting a button, run axe-core in your tests (for example with
  Playwright and `@axe-core/playwright`), and keep Snaglist for what people find.
- The built-in contrast check reads up to 300 pieces of text a run. Change it with `check: { contrastLimit: 600 }`.

## Find out more

- [Fix common accessibility problems](fix-common-accessibility-problems.md)
- [Settings reference](settings-reference.md)
