[Help centre](../README.md) · Settings

# Settings reference

Reference

Every setting, function and script tag attribute in Snaglist. Pass any of these to `Snaglist.start({ ... })`.
Everything is optional; the defaults are shown.

```js
Snaglist.start({
  app: "",                 // your app's name; the site's host name when empty
  version: "",             // your app's version, added to every report
  language: "auto",        // "auto" reads each page's lang; "en-US" uses US spelling; other languages through text
  theme: "light",          // Snaglist's windows: "light", "dark", or "auto" to follow the device
  enabled: true,           // your switch: false starts nothing
  userToggle: true,        // respect the user's own switch (Snaglist.setUserEnabled)
  launcher: "bottom-right",// "bottom-right", "bottom-left", or false to open it from your own menu
  shortcut: "",            // a keyboard shortcut, for example "Alt+Shift+R"
  types: ["bug", "ux", "visual", "accessibility", "performance", "content", "feature", "idea", "other", "check"], // what people can send, in order
  check: { engine: "built-in", axe: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js", integrity: "", contrastLimit: 300 }, // the accessibility check; integrity: the hash of your own copy of axe-core (the default copy is always checked)
  categories: null,        // an extra "Kind of issue" question for problems: "ux", "heuristics", "wcag" or your own list
  severities: "three",     // how bad a problem is: "three", "nielsen", or your own list
  importance: "importance",// how much a suggestion would help: the preset, or your own list
  labels: ["feedback"],    // GitHub labels on every report
  collect: {               // true: always; false: never; "auto": when the report type needs it
    page: true, element: "auto", text: "auto", steps: true, styles: "auto", layout: "auto", a11y: "auto", html: "auto",
    environment: true, display: true, performance: "auto",
    errors: "auto", console: "auto", network: "auto", trail: "auto", context: true,
  },
  limits: { errors: 5, console: 10, network: 8, trail: 8, slowRequest: 2000 }, // how many of each, and what counts as slow (ms)
  page: {
    name: null,            // () => "Checkout, step 2"; default: the document title
    keepParams: [],        // query parameters safe to keep, such as ["tab"]
  },
  component: {
    attribute: "data-component", // the nearest element with it names the component
    from: null,            // (element) => "ComponentName", your own way of naming
  },
  context: null,           // () => ({ build: "4f2a9c1", flags: "new-checkout" }): app details added to every report
  redact: [],              // more patterns to hide: [[/ORD-\d+/g, "[order]"]]
  send: {
    github: null,          // { repo: "owner/repo", labels: ["web"] }
    email: null,           // { to: "team@example.com", subject: "UX report" }
    endpoint: null,        // { url: "https://reports.example/api", headers: {} }
    copy: true,            // Copy as Markdown
    download: true,        // Download as JSON
  },
  beforeSend: null,        // (report) => report: add or remove anything; runs before the report is shown
  text: {},                // replace any interface text, for example { launcher: "Feedback" }; keys are in TEXT in snaglist.js
});
```

## What people can send

| Type | Shown as | Group | Asks | Records when set to "auto" |
|---|---|---|---|---|
| `bug` | Something is broken | Problem | What happened, what you expected, steps (when none were recorded) | element, text, html, errors, console, network, trail |
| `ux` | Hard to use | Problem | What is wrong | element, text, trail |
| `visual` | Looks wrong | Problem | What is wrong | element, text, styles, layout, html |
| `accessibility` | Hard to use with my tools or needs | Problem | What is wrong, what were you using | element, text, a11y, styles, layout |
| `performance` | Slow | Problem | What is wrong, when is it slow | performance, network, trail |
| `content` | Words are wrong | Problem | What is wrong, suggested wording | element, text |
| `feature` | A new feature | Suggestion | What you would like, what it would help with, how you manage today | page |
| `idea` | Make something better | Suggestion | What could be better, your suggestion | element |
| `other` | Something else | Suggestion | Your message | nothing extra |
| `check` | Check this page for accessibility problems | Check | Nothing: runs the check, then people choose what to report | page, environment, display, and the problems found |

Problems ask how bad it is (`severities`); suggestions ask how much it would help (`importance`); a type with
`scale: false` asks neither. Every type can show one thing on the page, record a series of steps, or describe it in words.

Your own type is an object. Add `group: "suggestion"` to list it under Make a suggestion, and `pick: false` to
start with the whole page. A field is `{ id, label, hint, type, options, required }`, where `type` is
`"textarea"`, `"text"` or `"select"`:

```js
Snaglist.start({
  types: ["bug", {
    id: "checkout",
    label: "Problem paying",
    hint: "Anything in the basket or checkout",
    fields: [
      { id: "what", label: "What went wrong", type: "textarea", required: true },
      { id: "method", label: "How were you paying", type: "select", options: [["card", "Card"], ["wallet", "Phone wallet"]] },
    ],
    collect: ["element", "errors", "network", "trail"],
  }],
});
```

The presets are in `Snaglist.presets.types`, `Snaglist.presets.categories` and `Snaglist.presets.severities`.

## What each part records

| Part | What it holds |
|---|---|
| `page` | The page's name and path; ids in the path become `:id`; no query or hash |
| `element` | The part chosen: component, role, label and a CSS selector |
| `text` | The visible text of the part chosen, up to 300 characters, and messages the page is showing (alerts, status messages, field errors) |
| `steps` | The steps recorded with A series of steps: what was selected, changed or sent, pages gone to, errors and failed requests, with the time of each |
| `styles` | Font size, weight and line height, text and background colours, and the contrast ratio with a WCAG pass or fail |
| `layout` | Size and position, display and position styles, content cut off or spilling out, what covers it, whether the page scrolls sideways |
| `a11y` | Role, accessible name, states (expanded, pressed, checked, invalid and others), whether it can be focused, target size against WCAG 2.5.8, landmark, page language, a missing label or alt text |
| `html` | The part's HTML with every bit of text and every field value taken out, and only safe attributes kept |
| `environment` | Window and screen size, zoom, browser and system family, language, touch, orientation, connection type, device memory and cores |
| `display` | Theme, text size, reduced motion, more contrast, forced colours |
| `performance` | Load timings, largest paint (LCP), layout shift (CLS), slowest interaction (INP), long tasks in the last minute, script memory, files that did not load |
| `errors` | Script errors and unhandled promise rejections with three lines of stack, and Content Security Policy blocks |
| `console` | Console errors and warnings |
| `network` | Requests that failed or took longer than `limits.slowRequest`: method, path without query, status and time |
| `trail` | What was selected, changed or sent, and page changes, by component and label only |
| `context` | Whatever your `context` function returns, such as a build number or feature flags |

`errors`, `console`, `network`, `trail` and `performance` record from the moment Snaglist starts, in memory on that
page only, so the details are there when someone reports. Set one to `false` and it records nothing at all.

## The script tag only

| Attribute | Setting |
|---|---|
| `data-github="owner/repo"` | `send.github.repo` |
| `data-email="team@example.com"` | `send.email.to` |
| `data-endpoint="https://..."` | `send.endpoint.url` |
| `data-types="bug ux visual"` | `types` |
| `data-app`, `data-version` | `app`, `version` |
| `data-start` | Start with the defaults, sending by Copy and Download only |

## Functions

| Function | What it does |
|---|---|
| `Snaglist.start(settings)` | Starts, or restarts with new settings. Returns false when deactivated |
| `Snaglist.destroy({ forget })` | Removes everything from the page and puts back anything it wrapped; `forget: true` also clears the user's switch |
| `Snaglist.open(type)` | Opens Send feedback, as the button does; give a type, such as `"feature"`, to choose it already. Use it from your own menu |
| `Snaglist.report(element, type)` | Opens Send feedback about one element; with a type, goes straight to its form |
| `Snaglist.setUserEnabled(on)` | The user's switch, remembered in this browser |
| `Snaglist.isUserEnabled()` | Whether the user's switch is on |
| `Snaglist.redact(text)` | The same hiding the reports use, for your own text |
| `Snaglist.strings()` | Every piece of interface text by key, to translate and give back as `text` |
| `Snaglist.version` | The version running on the page |

## GitHub labels

Each report asks for `feedback`, `problem` or `suggestion`, `type: <type>`, `severity: <how bad>` or
`importance: <how much it would help>`, `kind: <kind>` when you ask the extra question, and your own labels. GitHub only adds labels that exist, and only when the person reporting may label
issues. The same details are always in the report, so nothing is lost.

## Content Security Policy

Snaglist needs no inline script, no inline styles and no other site, so it works under a strict policy such as
`default-src 'self'`. It styles its own shadow root with a constructed style sheet, which a policy does not block.
Only a browser too old for constructed style sheets falls back to a `<style>` element, which needs
`'unsafe-inline'` for styles.

## Find out more

- [Choose what people can send](choose-what-people-can-send.md)
- [Show Snaglist in your language](show-snaglist-in-your-language.md)
- [Activate the accessibility check](activate-the-accessibility-check.md)
- [Choose what a report records](choose-what-a-report-records.md)
- [What a report holds, and what it never holds](what-a-report-holds.md)
