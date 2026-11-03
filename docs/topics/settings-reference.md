[Help centre](../README.md) · Reference · Reference

# Settings reference

Every setting, function and script tag attribute in Snaglist. Pass any of these to `Snaglist.start({ ... })`. Everything is optional; the defaults are shown.

```js
Snaglist.start({
  app: "",                 // your app's name; the site's host name when empty
  version: "",             // your app's version, added to every report
  enabled: true,           // your switch: false starts nothing
  userToggle: true,        // respect the user's own switch (Snaglist.setUserEnabled)
  launcher: "bottom-right",// "bottom-right", "bottom-left", or false to open it from your own menu
  shortcut: "",            // a keyboard shortcut, for example "Alt+Shift+R"
  categories: "ux",        // "ux", "heuristics", "wcag", or your own list
  severities: "three",     // "three", "nielsen", or your own list
  labels: ["ux-report"],   // GitHub labels on every report
  collect: {
    page: true,            // page name and path pattern
    element: true,         // the part chosen
    styles: false,         // its font and colours, and their contrast
    environment: true,     // viewport, zoom, browser and system family, language
    display: true,         // theme, text size, motion and contrast preferences
    errors: false,         // the last five script errors
    trail: false,          // the last five things selected
  },
  page: {
    name: null,            // () => "Checkout, step 2"; default: the document title
    keepParams: [],        // query parameters safe to keep, such as ["tab"]
  },
  component: {
    attribute: "data-component", // the nearest element with it names the component
    from: null,            // (element) => "ComponentName", your own way of naming
  },
  redact: [],              // more patterns to hide: [[/ORD-\d+/g, "[order]"]]
  send: {
    github: null,          // { repo: "owner/repo", labels: ["web"] }
    email: null,           // { to: "team@example.com", subject: "UX report" }
    endpoint: null,        // { url: "https://example.com/api/reports", headers: {} }
    copy: true,            // Copy as Markdown
    download: true,        // Download as JSON
  },
  beforeSend: null,        // (report) => report: add or remove anything; runs before the person sees it
  text: {},                // replace any interface text, for example { launcher: "Feedback" }
});
```

## Your own kinds and severities

A list item is `[value, label, hint]`. The value goes into labels and the JSON; the label and hint are shown.

```js
Snaglist.start({
  categories: [
    ["copy", "Wording", "Unclear or wrong text"],
    ["checkout", "Checkout", "Anything in paying"],
    ["other", "Something else", ""],
  ],
  severities: [["low", "Low", ""], ["high", "High", "Blocks a purchase"]],
});
```

The presets are in `Snaglist.presets` if you want to extend one:

```js
const kinds = [...Snaglist.presets.categories.ux, ["performance", "Slow", "Takes too long"]];
```

## The script tag only

For the simplest set-up, put the settings on the tag. It starts when the page has loaded.

| Attribute | Setting |
|---|---|
| `data-github="owner/repo"` | `send.github.repo` |
| `data-email="team@example.com"` | `send.email.to` |
| `data-endpoint="https://..."` | `send.endpoint.url` |
| `data-app`, `data-version` | `app`, `version` |
| `data-start` | Start with the defaults, sending by Copy and Download only |

## Functions

| Function | What it does |
|---|---|
| `Snaglist.start(settings)` | Starts, or restarts with new settings. Returns false when switched off |
| `Snaglist.destroy({ forget })` | Removes everything from the page; `forget: true` also clears the user's switch |
| `Snaglist.open()` | Starts choosing a part, as the button does: use it from your own menu |
| `Snaglist.report(element)` | Opens the form for one element, or the whole page with no element |
| `Snaglist.setUserEnabled(on)` | The user's switch, remembered in this browser |
| `Snaglist.isUserEnabled()` | Whether the user's switch is on |
| `Snaglist.redact(text)` | The same hiding the reports use, for your own text |

## GitHub labels

GitHub only adds labels when the person reporting may label issues in that repository, and only labels that
exist. Every report also lists its kind and severity in the body, so nothing is lost. To have labels on every
report, file them through your own server ([Send reports to your own server](send-reports-to-your-own-server.md)), or let a GitHub Action add labels from the
body.

## Content Security Policy

Snaglist needs no inline script and no other site. It sets styles through a `<style>` element in its own shadow
root, so a policy with `style-src 'self'` needs `'unsafe-inline'` for styles, or a nonce on the script's styles.
A future version may ship a stylesheet file instead.

## Find out more

- [Choose what a report records](choose-what-a-report-records.md)
- [Choose the kinds of issue and how bad they can be](choose-the-kinds-of-issue.md)
- [What a report holds, and what it never holds](what-a-report-holds.md)
