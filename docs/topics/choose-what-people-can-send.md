[Help centre](../README.md) · Settings

# Choose what people can send

How-to

The first question people answer is "What would you like to send". Each choice is a problem or a suggestion,
asks its own questions and records the technical details needed to act on it. Offer the ones that suit your site.

## Steps

1. Decide which to offer. The nine built in:

   | Type | Shown as | Group | Records for developers |
   |---|---|---|---|
   | `bug` | Something is broken | Report a problem | Text on screen, script errors, console, failed requests, steps before, the part's HTML |
   | `ux` | Hard to use | Report a problem | The part, text on screen, steps before |
   | `visual` | Looks wrong | Report a problem | Text on screen, styles, contrast, layout, what covers it, the part's HTML |
   | `accessibility` | Hard to use with my tools or needs | Report a problem | Role, name, states, focus, target size, contrast, layout |
   | `performance` | Slow | Report a problem | Load timings, Core Web Vitals, long tasks, slow requests |
   | `content` | Words are wrong | Report a problem | The part, its text, and a suggested wording |
   | `feature` | A new feature | Make a suggestion | What, why, how they manage today, and how much it would help |
   | `idea` | Make something better | Make a suggestion | The part, what could be better, the suggestion |
   | `other` | Something else | Make a suggestion | A free message |

2. List the ones you want, in the order to offer them:

   ```js
   Snaglist.start({ types: ["bug", "visual", "feature", "idea"] });
   ```

   With the script tag only, use `data-types="bug visual feature idea"`. The
   [set-up tool](use-the-set-up-tool.md) has a tick box for each.
3. Make a test report of each and check its questions and its preview in **What is sent**.

## Things to note

- Problems ask 'How bad is it'; suggestions ask 'How much would it help you'. 'Something else' asks neither.
- With every type, people can show one thing on the page, record a series of steps, or describe it in words.
- A type of your own can ask its own questions and record any of the parts. Set `group: "suggestion"` to list it
  under 'Make a suggestion'. The [settings reference](settings-reference.md) has an example.
- For the public, `bug`, `ux`, `feature` and `other` are often enough. For a test team, offer them all.

## Find out more

- [Choose what a report records](choose-what-a-report-records.md)
- [Choose the kinds of issue and how bad they can be](choose-the-kinds-of-issue.md)
