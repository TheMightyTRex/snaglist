# Changelog

All notable changes to Snaglist are listed here, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), with dates written as in the
[TRex Design System](https://github.com/TheMightyTRex/design-system/blob/main/docs/CHANGELOGS.md), and versions
follow [Semantic Versioning](https://semver.org/). Each release's notes are also in [docs/releases](docs/releases).

## [Unreleased]

### Added
- **A changelog.** This file lists every version since 0.1.0.

## [0.3.2] (3 November 2026)

The first full security check of Snaglist. [Security and tests](docs/SECURITY-AND-TESTS.md) has what was found,
how each problem was fixed and the test for it.

### Added
- **Tests.** `tools/test.sh` runs Snaglist's security and privacy tests in a real browser, and
  `tools/security-scan.sh` runs the security scanners.
- **Private reporting.** Report a security problem privately with **Report a vulnerability** on the repository's
  **Security** tab, as `SECURITY.md` says.

### Changed
- **Privacy statement.** The review window says what a report leaves out, and that the page title and the text
  on screen are copied as they are.
- **Logo.** The wordmark's letters have a 2px white outline, so the logo reads on dark backgrounds.

### Security
- **Set-up tool.** A shared link can no longer put a command, code or instructions into what the tool writes.
  The repository, the app details value and the language code are checked, with an error under the field.
- **Choices in fields.** Recorded steps and the trail no longer keep the option chosen in a list, a ticked box, a
  selected radio button or a picked suggestion: only that a choice was made, and where.
- **Editable areas.** Text typed into an editable area (`contenteditable`) is never in a report, and private parts
  inside the chosen part are left out of its text.
- **Messages.** Error and console messages keep each address without its query or hash, stay on one line, and
  show only the keys of a logged object.
- **More keys and numbers replaced.** `access_token=`, `Authorization: Bearer`, `session=`, `pwd=`, AWS key ids
  and phone numbers written with dots.
- **The part's HTML.** `tel:`, `mailto:` and similar links keep only their scheme, and value attributes such as
  `aria-valuetext` are taken out.
- **GitHub.** Text from the page can no longer mention anyone, break out of a code block or add a table column.
  Reports cut inside an emoji open on GitHub again.
- **Safari.** A very long console message no longer holds up the page while Snaglist cleans it.
- **axe-core.** Loaded only with its integrity hash; `check.integrity` gives the hash for your own copy.
- **Removing Snaglist.** destroy() puts back only its own wrappers, never another tool's, and takes away the
  axe-core it loaded.
- **Example worker.** Uses a rate limit when one is set up, refuses oversized requests before reading them, and
  stops mentions. Add a rate limit before you make it public.
- **Privacy check.** `tools/check-private.sh` catches a private word written with "TRex", and stops if it cannot
  find the repository.
- **Checks.** This release was checked with free security scanners, an independent code review and new tests in
  a real browser. The results are in [Security and tests](docs/SECURITY-AND-TESTS.md).

## [0.3.1] (3 November 2026)

### Changed
- **Recorded steps and accessibility check results** are disclosures in the design system's style: a bordered
  box, a 44px header with a count, and a chevron that turns when open.
- **Words** follow the design system's content design guide and help writing guide: "activate" and
  "deactivate", "enter", labels outside steps in single quotation marks, made-up examples, errors that say what
  is safe, and file links that name their type.
- **Help.** Each topic's kind is on its own line under the title, areas follow the help guide's order, topics
  are renamed to activate and deactivate, and flowcharts are described for screen readers. Screenshots retaken.
- **Scroll bars** in Snaglist's windows, the report preview, the demo and the set-up tool are thin and square,
  visible whenever there is more to scroll, with space kept for them so nothing jumps. A shadow at the edge of a
  scrolling window shows there is more.

## [0.3.0] (3 November 2026)

### Added
- **Feedback of every kind.** Report a problem (broken, hard to use, looks wrong, accessibility, slow, words) or
  make a suggestion (a new feature, make something better, something else), each with its own questions.
  Suggestions ask how much they would help.
- **Step recorder** with Start recording, Pause, Resume, Stop and describe, Start again and Cancel. It notes what
  is selected, changed and sent, pages, errors and failed requests, never what is typed, and carries on across
  pages in the same tab.
- **Text on screen.** The visible text of the chosen part and any messages the page shows, redacted.
- **Accessibility check.** 13 built-in rules, each with its WCAG criterion, why, how to fix and code before and
  after, or axe-core. Show a problem on the page, then report one or all.
- **Languages.** US spelling when the page is en-US, every string replaceable with `Snaglist.strings()`, and
  right to left for Arabic, Hebrew, Persian and Urdu.
- **Set-up tool** (`configure.html`): choose everything, then get `snaglist-start.js`, the code and where it goes
  for each platform, label commands, and one prompt for any AI assistant.
- **Logo, wordmark and favicon.**

### Changed
- **One flow.** Choose what to send, then show one thing on the page, record a series of steps, or describe it.
  The form shows one summary, the text on screen and only the questions that type needs.
- **Light theme by default,** with dark or automatic on request.
- **Demo** is light by default, with Display and accessibility settings and seven accessibility problems to
  find. Help, prompts, the README and `llms.txt` are updated.

## [0.2.0] (3 November 2026)

### Added
- **Report types,** chosen when you add Snaglist with `types`: Something is broken, Hard to use, Looks wrong,
  Accessibility, Slow, Words are wrong and Idea, or your own. Each asks its own questions and records what is
  needed to fix it.
- **More technical details,** each set to always, never or automatic (when the type needs it): script errors
  with their stack and content security policy blocks, console errors and warnings, failed and slow requests,
  layout problems, accessibility details, the part's HTML with all text removed, page speed, and app details
  from a `context` function.
- **Help centre in two tiers:** topics that do one task each and guides made of topics, for adding, running,
  using, updating and removing Snaglist, hosting it on your own server, and for the people who report.
- **Prompts for any AI assistant** (`docs/AI-PROMPTS.md`) to add, deactivate, tune, check and remove Snaglist,
  and `llms.txt`, a short summary for AI tools.

### Changed
- **"Kind of issue"** is an optional extra question, inactive by default.
- **Everything recorded** is redacted, kept in memory on the page and shown before sending. destroy() puts back
  fetch, XMLHttpRequest and console exactly as they were.

### Fixed
- **Open in GitHub** no longer also sends the page itself to GitHub, and mail links open without a blank tab.

## [0.1.0] (3 November 2026)

The first version. It was not tagged.

### Added
- **Report a UX issue on any page,** tagged with the page and the part of it, without personal information. One
  file with no libraries, added with a script tag and removed cleanly.
- **Choose a part** by pointer or keyboard, review exactly what is sent, then open a GitHub issue or an email,
  post to your own server, copy or download.
- **Presets** for everyday UX, Nielsen's heuristics and WCAG, three or four severity levels, and settings for what
  to record.
- **A demo page,** documentation, prompts for AI coding assistants and an example server.

[Unreleased]: https://github.com/TheMightyTRex/snaglist/compare/v0.3.2...HEAD
[0.3.2]: https://github.com/TheMightyTRex/snaglist/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/TheMightyTRex/snaglist/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/TheMightyTRex/snaglist/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/TheMightyTRex/snaglist/compare/7542413...v0.2.0
[0.1.0]: https://github.com/TheMightyTRex/snaglist/commit/7542413
