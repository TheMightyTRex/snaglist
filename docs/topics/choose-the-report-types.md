[Help centre](../README.md) · Add and set up · How-to

# Choose the report types

The first question in the form is "What kind of report". Each type asks its own questions and records the
technical details needed to fix that kind of problem. Offer the types that suit your site.

## Steps

1. Decide which types to offer. The seven built in:

   | Type | Shown as | For | Records for developers |
   |---|---|---|---|
   | `bug` | Something is broken | Errors, buttons that do nothing, wrong data | Script errors, console, failed requests, steps before, the part's HTML |
   | `ux` | Hard to use | Confusing, too many steps | The part and steps before |
   | `visual` | Looks wrong | Overlaps, cut off, wrong colour or size | Styles, contrast, layout, what covers it, the part's HTML |
   | `accessibility` | Accessibility | Keyboard, screen reader, zoom, contrast | Role, name, states, focus, target size, contrast, layout |
   | `performance` | Slow | Slow loading, freezing, stutter | Load timings, Core Web Vitals, long tasks, slow requests |
   | `content` | Words are wrong | Spelling, unclear or old text | The part, and a suggested wording |
   | `idea` | Idea | Suggestions | Nothing extra |

2. List the ones you want, in the order to offer them:

   ```js
   Snaglist.start({ types: ["bug", "visual", "accessibility"] });
   ```

   With the script tag only, use `data-types="bug visual accessibility"`.
3. Make a test report of each type and check its questions and its preview in **What is sent**.

## Things to note

- With one type, the question is not asked: the form goes straight to its fields.
- A type of your own can ask its own questions and record any of the parts. The
  [settings reference](settings-reference.md) has an example.
- Technical details only appear for the types that need them. To record a part for every type, or never, read
  [Choose what a report records](choose-what-a-report-records.md).
- For a test team, offer more types. For the public, `bug`, `ux` and `idea` are often enough.

## Find out more

- [Choose the kinds of issue and how bad they can be](choose-the-kinds-of-issue.md)
- [Triage reports on GitHub](triage-reports-on-github.md)
