[Help centre](../README.md) · Settings

# Choose the kinds of issue and how bad they can be

How-to

Every problem report asks how bad it is, and every suggestion how much it would help. You can also ask an extra question, "Kind of issue", to sort reports
by a scheme your team already uses, such as Nielsen's heuristics or the WCAG principles.

## Steps

1. Choose a scale for how bad it is, with `severities`:
   - `"three"` (the default): Minor, Gets in the way, Stops me.
   - `"nielsen"`: 1 Cosmetic, 2 Minor, 3 Major, 4 Catastrophe.
2. If you want an extra question for problems, choose a list with `categories`. It is off by default:
   - `"ux"`: Layout, Words, Behaviour, Accessibility and Looks.
   - `"heuristics"`: Jakob Nielsen's 10 usability heuristics, in plain words. Best for UX reviews.
   - `"wcag"`: the four WCAG (Web Content Accessibility Guidelines) principles. Best for accessibility testing.
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

5. Suggestions use **How much would it help you**: Nice to have, I would use it often, I need it. To use your own
   scale, set `importance` to a list in the same format.

## Things to note

- What people send already sorts reports broadly ([Choose what people can send](choose-what-people-can-send.md)). Only
  add the extra question when your team needs the finer scheme.
- The value goes into GitHub labels (`kind: wording`) and the report's data, so keep it short, lower case and
  without spaces.
- Three levels are rated more consistently than four or five, so keep `"three"` unless your team already uses
  Nielsen's scale.

## Find out more

- [Triage reports on GitHub](triage-reports-on-github.md)
- [Settings reference](settings-reference.md)
