# Snaglist

Report a UX issue on any page, tagged with the page and the part of it, without personal information.

A snag list is a list of the small faults to fix before a job is finished. Snaglist adds a **Report an issue**
button to your app or site. The person reporting chooses the part of the page with the problem, says what is
wrong and how bad it is, checks exactly what will be sent, and sends it as a GitHub issue, an email or a post to
your own server.

**[Try it on the demo page](https://themightytrex.github.io/snaglist/)** · **[Help centre](docs/README.md)** ·
**[Prompts for AI assistants](docs/AI-PROMPTS.md)**

- One file, about 40 KB, with no libraries and no build step.
- Installs with one script tag and removes cleanly: one element, its own styles, nothing left behind.
- Anonymous by design: no field contents, no cookies, no full addresses or query strings, and anything that
  looks like an email, phone number, address or key is replaced. The person sees the whole report before it goes.
- Keyboard first: choose a part with Tab and Enter, Escape stops. 44px targets, a visible focus ring, works with
  reduced motion and forced colours, and follows the page's text size.
- Takes its colours from your design tokens when you have them, and has its own light and dark look when you do
  not.

## Add it

1. Copy `snaglist.js` into your site.
2. Add one line before `</body>`, with the GitHub repository reports should go to:

   ```html
   <script src="snaglist.js" data-github="owner/repo" defer></script>
   ```

   Or start it yourself, with any of the settings in the [settings reference](docs/topics/settings-reference.md):

   ```html
   <script src="snaglist.js"></script>
   <script>
     Snaglist.start({
       app: "My app",
       version: "1.4.0",
       send: { github: { repo: "owner/repo" }, email: { to: "team@example.com" } },
     });
   </script>
   ```

## Remove it

Delete the script tag. To remove it from a running page and clear what it saved in the browser (only the
user's on and off switch):

```js
Snaglist.destroy({ forget: true });
```

## Turn it on and off

- **You, the developer:** `enabled: false` in the settings, or do not call `Snaglist.start()`, for example
  outside your test builds.
- **Your users:** give them a switch. `Snaglist.setUserEnabled(false)` hides the button and remembers the choice
  in this browser; `Snaglist.setUserEnabled(true)` brings it back. Read
  [Add a switch for your users](docs/topics/add-a-switch-for-your-users.md).

## What a report holds

The person's description, the kind of issue and how bad it is, then whatever you choose to record:

| Setting | What it adds | On by default |
|---|---|---|
| `page` | The page's name and its path, with numbers and ids replaced by `:id` and no query or hash | Yes |
| `element` | The part chosen: its component, role, label, a CSS selector and its size | Yes |
| `styles` | Its font size and weight, text and background colours, and their contrast ratio | No |
| `environment` | Viewport, zoom, browser and system family (for example "Firefox 132 on Linux"), language | Yes |
| `display` | Theme, text size, reduced motion, more contrast, forced colours | Yes |
| `errors` | The last five script errors on the page, redacted | No |
| `trail` | The last five things selected on the page (component and label only) | No |

The kinds of issue come from three presets: everyday UX (layout, words, behaviour, accessibility, looks,
broken, slow, idea), Nielsen's ten usability heuristics, or the four WCAG principles. Severity is three levels
(minor, gets in the way, stops me) or Nielsen's 1 to 4. You can give your own lists.

[What a report holds, and what it never holds](docs/topics/what-a-report-holds.md) says what is never
collected and how it is hidden.

## Sending

| Way | How | Needs |
|---|---|---|
| GitHub | Opens a new issue with the title, report and labels filled in. The person posts it from their own account | A GitHub account for the person reporting |
| Email | Opens their mail app with the report filled in | A mail app |
| Your server | Posts the report as JSON, without cookies | An address that accepts it; [Send reports to your own server](docs/topics/send-reports-to-your-own-server.md) has an example that files GitHub issues for people without an account |
| Copy and Download | Markdown on the clipboard, or a JSON file | Nothing |

No token or password is ever put in the page.

## Tag components

Snaglist names the part chosen from, in order: your own function (`component.from`), the nearest
`data-component` attribute, then the first plain class name (such as `card` or `btn`). Add
`data-component="checkout-summary"` to the parts of your app you want named clearly. Add `data-snag-private` to
anything that shows personal details, such as an account name: its text is never read.

## Help

The [help centre](docs/README.md) has guides from start to finish and a topic for each task:

- [Add Snaglist to your site and get your first report](docs/guides/add-snaglist-to-your-site.md)
- [Set up Snaglist on your own server](docs/guides/set-up-snaglist-on-your-own-server.md)
- [Run a test session with Snaglist](docs/guides/run-a-test-session.md)
- [Report issues on a site that uses Snaglist](docs/guides/report-issues-on-a-site.md), for the people reporting
- [Take Snaglist out of your site](docs/guides/take-snaglist-out-of-your-site.md)

Building with an AI assistant? [Prompts for AI assistants](docs/AI-PROMPTS.md) work with any of them, and
[llms.txt](llms.txt) is a short summary written for AI tools.

## Part of a family

Snaglist began as the UX notes tool in the [design system](https://github.com/TheMightyTRex/design-system)
shared by [Storyarr](https://github.com/TheMightyTRex/storyarr) and
[Starboard](https://github.com/TheMightyTRex/starboard), and uses its design tokens when a page has them.

## Ideas for later

- A picture of the chosen part, opt-in, blurred outside it.
- A test session mode: collect several reports, then send them as one.
- Look for similar open issues before sending, to cut duplicates.
- A quick automatic accessibility check of the chosen part.
- Wrappers for React, Vue and WordPress, and translations of the interface text.

## Licence

MIT. See [LICENSE](LICENSE). The flag and close icons are from [Lucide](https://lucide.dev) (ISC).
