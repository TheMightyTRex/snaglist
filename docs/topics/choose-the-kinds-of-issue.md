[Help centre](../README.md) · Add and set up · How-to

# Choose the kinds of issue and how bad they can be

People choose a kind of issue and how bad it is for every report. Pick the lists that suit your team, or write
your own.

## Steps

1. Choose a list of kinds with `categories`:
   - `"ux"` (the default): Layout, Words, Behaviour, Accessibility, Looks, Broken, Slow and Idea. Best for
     testers and everyday users.
   - `"heuristics"`: Jakob Nielsen's 10 usability heuristics, in plain words. Best for UX reviews.
   - `"wcag"`: the four WCAG (Web Content Accessibility Guidelines) principles. Best for accessibility
     testing.
2. Choose a scale with `severities`:
   - `"three"` (the default): Minor, Gets in the way, Stops me.
   - `"nielsen"`: 1 Cosmetic, 2 Minor, 3 Major, 4 Catastrophe.
3. Set them:

   ```js
   Snaglist.start({ categories: "heuristics", severities: "nielsen" });
   ```

4. Or give your own lists. Each item is a value, a label and a hint:

   ```js
   Snaglist.start({
     categories: [["wording", "Wording", "Unclear or wrong text"], ["checkout", "Checkout", "Anything in paying"]],
     severities: [["low", "Low", ""], ["high", "High", "Stops a purchase"]],
   });
   ```

## Things to note

- The value goes into GitHub labels (`kind: wording`) and the report's data, so keep it short, lower case and
  without spaces.
- Three levels are rated more consistently than four or five, so keep `"three"` unless your team already uses
  Nielsen's scale.

## Find out more

- [Triage reports on GitHub](triage-reports-on-github.md)
- [Settings reference](settings-reference.md)
