[Help centre](../README.md) · Settings

# Choose what a report records

How-to

Every report holds the person's answers, what they are sending and how much it matters. You choose what else it records,
and when: always, never, or only for the report types that need it.

## Steps

1. Decide what you need. The defaults suit most sites:

   | Part | What it adds | Default |
   |---|---|---|
   | `page` | Page name and path, ids as `:id`, no query or hash | Always |
   | `element` | The part chosen: component, role, label, selector | When needed |
   | `text` | The visible text of the part chosen, and any error or alert messages on the page | When needed |
   | `steps` | The steps recorded with A series of steps | Always, when there are some |
   | `styles` | Font, colours and contrast, with a WCAG pass or fail | When needed |
   | `layout` | Size, position, content cut off, what covers it | When needed |
   | `a11y` | Role, name, states, focus, target size, landmark | When needed |
   | `html` | The part's HTML with all text and values taken out | When needed |
   | `environment` | Window, screen, zoom, browser, system, language, connection, device | Always |
   | `display` | Theme, text size, motion and contrast preferences | Always |
   | `performance` | Load timings, Core Web Vitals, long tasks, script memory | When needed |
   | `errors` | Script errors with stack lines | When needed |
   | `console` | Console errors and warnings | When needed |
   | `network` | Failed and slow requests: method, path, status, time | When needed |
   | `trail` | What was selected, changed or sent before | When needed |
   | `context` | Your own app details, from a function you give | Always, when you give one |

2. Set any you want to change in `collect`. `true` is always, `false` is never, `"auto"` is when the report
   type needs it:

   ```js
   Snaglist.start({ collect: { styles: true, console: false } });
   ```

3. To add your own details, such as a build number or feature flags, give a `context` function:

   ```js
   Snaglist.start({ context: () => ({ build: "4f2a9c1", flags: "new-checkout" }) });
   ```

4. Make a test report and check the preview in **What is sent**.

## Things to note

- `errors`, `console`, `network`, `trail` and `performance` record in the background from the moment Snaglist
  starts, in memory on that page only. Nothing leaves the page unless someone sends a report. `false` stops the
  recording completely.
- Each is redacted: no query strings, ids in paths become `:id`, and emails, numbers and keys are replaced.
- Change how many of each a report keeps, and what counts as a slow request, with `limits`:
  `limits: { console: 20, slowRequest: 1000 }`.
- People can still untick any part in 'What is sent' before they send it.

## Find out more

- [Choose what people can send](choose-what-people-can-send.md)
- [Keep personal details out of reports](keep-personal-details-out.md)
- [Settings reference](settings-reference.md)
