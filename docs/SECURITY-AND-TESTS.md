# Security: how Snaglist protects people, and how it was tested

Snaglist runs inside other people's websites and sends what it finds to GitHub, an email or the site's own
server. So it must never carry away what someone typed or who they are, never let the page or a link change
what it sends, and never put the site at risk. This page says how it does that, what the security check in
November 2026 found and fixed, and which tests pass today.

To report a problem, open an issue at github.com/TheMightyTRex/snaglist. For anything that could be misused,
leave the details out of the issue and ask how to send them. For what a report holds, see
[What a report holds, and what it never holds](topics/what-a-report-holds.md).

Latest results: 3 November 2026.

## How Snaglist protects people

**What it never takes**
- Nothing typed into the page: field values, editable areas and the choices made in lists, tick boxes and radio
  buttons are left out. A step says "Entered text in Your name" or "Made a choice in Title", never what it was.
- No cookies, storage, accounts or query strings. Addresses keep their path, with ids replaced by `:id`; the
  query and the hash are taken out, including from addresses inside error and console messages.
- Emails, phone and card numbers, IP addresses, ids, keys and tokens are replaced in everything a report holds,
  and anything inside `data-snag-private` is left out.
- The person sees the whole report before it goes, and can take parts out.

**What the page cannot do**
- Snaglist builds everything as text, never as HTML, so text from the page is shown, never run.
- Text from the page cannot break out of a report's tables or code blocks, and cannot mention anyone on GitHub.
- When Snaglist is removed, it puts back everything it wrapped, but never undoes a wrapper another tool added
  later.

**What it loads**
- One file, no libraries. The optional axe-core is pinned to one version and checked against its hash.

## The security check, November 2026

Snaglist 0.3.1 was checked in three ways: the free scanners below, an independent code review by a reviewer who
had not seen the scan results, and new tests in a real browser for every real finding. No high or critical
problems were found. Thirteen medium or low problems were real; all are fixed, and each fix has a test that
failed before it and passes now.

| Severity | What was found | How it was fixed | Test |
|---|---|---|---|
| Medium | The set-up tool fills its fields from a shared link. A crafted link could put a shell command into the label commands, code into snaglist-start.js and instructions into the AI prompt. | The repository, the app details value and the language code must have the right shape, or they are left out with an error under the field. The button words are quoted in the prompt. An unknown choice in a link is ignored. | SEC-04 |
| Medium | Recorded steps and the trail kept the choice made in a field: the option chosen in a list, a ticked box, a selected radio button or a picked suggestion. | Only that a choice was made, and in which group or field, is kept. | SEC-05 |
| Medium | Text typed into an editable area (`contenteditable`) was kept as text on screen, and private parts inside a chosen part were not left out. | Editable areas and private parts inside the chosen part are left out. | SEC-01 |
| Medium | Error and console messages kept addresses with their query strings, and logged objects with their values. | Each address keeps its path only; a logged object shows its keys only. | SEC-02, SEC-06 |
| Medium | Several key and number formats were not replaced: `access_token=`, `Authorization: Bearer`, `session=`, `pwd=`, AWS key ids and phone numbers written with dots. | Each is replaced now. Error codes, timings and version numbers stay. | SEC-07 |
| Medium | A part's HTML kept phone numbers in `tel:` links, names in `skype:` links, and values in `aria-valuetext`, `aria-description`, `id` and `data-testid`. | A link to anything but a web page keeps only its scheme. Value attributes become `…`, and every other kept attribute has emails, numbers and keys replaced. | SEC-08 |
| Medium | The example worker for your own server could be used by anyone to make issues, because the origin check stops other websites but not people. | The example uses a rate limit when one is set up, refuses an oversized request before reading it, and stops mentions. The help says to add a rate limit before it is public. | SEC-13 to SEC-16 |
| Low | A console message or an address could break out of a report's code block, and mention people on GitHub. | Messages and steps stay on one line, and an invisible space follows every `@`. | SEC-09 |
| Low | A backslash or `\|` in page text could add a column to a report's tables (found by CodeQL). | Backslashes are escaped too. | SEC-19 |
| Low | Cutting text in the middle of an emoji stopped GitHub and email sending. | Text is never cut through an emoji. | SEC-11 |
| Low | axe-core was loaded without a hash. | The default copy is checked against its hash; `check.integrity` gives one for your own copy. destroy() takes it away again. | SEC-03 |
| Low | destroy() could remove a wrapper another tool added after Snaglist. | It puts back only its own. | SEC-12 |
| Low | The privacy check let a private word through when written with "TRex", and ignored a word starting with a hyphen. | A private word is let through only inside an allowed public name. | SEC-17, SEC-18 |

**Also changed**
- Long messages are cut before they are cleaned, and the email pattern is bounded. The reviewer found the email
  pattern slow on a very long message in Node; it was not slow in Chrome, so SEC-10 guards it rather than proving
  the fix.
- The review window's privacy statement no longer says no personal information is kept, because the page title
  and the text on screen are copied as they are. It says what is left out, and asks people to check the rest.
- The test and screenshot tools serve only the files git would publish, so `.git` and `.private-words` are never
  on offer, even on this computer.
- `tools/check-private.sh` stops if it cannot find the repository (ShellCheck).

**Left as they are, on purpose**
- **Page titles and the text on screen** are copied as they are, because they are what developers need to find
  the problem. The person sees them before sending, sites can mark parts `data-snag-private`, and
  `page.name` can replace the title.
- **Names in paths and class names** (such as a picture called after a person) are kept, apart from ids,
  numbers, emails and keys. They are part of the site's structure.
- **A report sent to GitHub travels in the address**, so it is in the browser's history. That is how GitHub's
  new issue form works; Copy, Download and your own server avoid it.
- **Answers are kept in the tab's session storage while a recording runs**, so they survive going to another
  page. They are cleared when the recording stops, is cancelled or Snaglist is removed.
- **The demo and set-up pages on GitHub Pages** have no content security policy, frame or content type headers,
  because GitHub Pages cannot set them, and they load the design system's style sheets without a hash, because
  those change with each design system update. Nothing from a visitor is written into the pages as HTML, and
  they hold nothing worth tricking anyone into.
- **Snaglist's window is an open shadow root**, so the page's own scripts can see what is typed into Snaglist's
  form, as they can for any part of the page. A site that records sessions should leave Snaglist out of them.

## Security tests and results

`tools/test.sh` runs every test: the shell tests here, then the browser tests in the Playwright image. Each
prints its ID.

| ID | What is tested | Result |
|---|---|---|
| SEC-01 | Text typed into an editable area is never in a report | Pass |
| SEC-02 | Query strings and hashes inside console and error messages are taken out | Pass |
| SEC-03 | axe-core is loaded only with its integrity hash | Pass |
| SEC-04 | A shared set-up link cannot put code or commands into what the tool writes | Pass |
| SEC-05 | Recorded steps and the trail never keep the choice made in a field | Pass |
| SEC-06 | Objects logged to the console show their keys only | Pass |
| SEC-07 | Common key, token and number formats are replaced, and error codes, timings and versions stay | Pass |
| SEC-08 | A part's HTML holds no phone numbers, chat names or values in other attributes | Pass |
| SEC-09 | Messages from the page cannot break out of code blocks or mention people | Pass |
| SEC-10 | A very long console message is handled quickly | Pass |
| SEC-11 | A report cut inside an emoji still opens on GitHub | Pass |
| SEC-12 | destroy() leaves wrappers added later by other tools in place | Pass |
| SEC-13 | The example worker files a report, and refuses other sites | Pass |
| SEC-14 | The example worker cannot be used to mention people on GitHub | Pass |
| SEC-15 | The example worker refuses an oversized request before reading it | Pass |
| SEC-16 | The example worker uses a rate limit when one is set up | Pass |
| SEC-17 | The privacy check catches a private word written with "TRex", and lets the public names through | Pass |
| SEC-18 | The privacy check checks a private word that starts with a hyphen | Pass |
| SEC-19 | A backslash or `\|` in page text cannot add a column to a report's tables | Pass |
| SEC-20 | Snaglist is styled under a strict Content Security Policy (`default-src 'self'`) | Pass |

The journeys in `tools/screenshots.sh` go through every main path in a real browser (one part, a recording, a
suggestion, a phone in dark mode, the accessibility check, the demo's display settings and the set-up tool) and
retake the pictures in the help.

## Security scans

`tools/security-scan.sh` runs the free scanners, all in Docker from pinned images. `--full` adds an active ZAP
scan and CodeQL. ZAP scans a throwaway copy of the pages on a private Docker network with no way out, so it can
never reach other apps on the same computer. Snaglist has no server, sign-in or Docker image, so there is no
signed-in scan, image scan or Hadolint.

| Scanner | What it checks | Found on 3 November 2026 | Now |
|---|---|---|---|
| Gitleaks | Keys and passwords anywhere in the git history | Nothing | Nothing |
| Trivy | Keys, known problems and risky set-up in the files | Nothing (there are no packages to check) | Nothing |
| ESLint, with the no-unsanitized and security rules | HTML built from text, eval, and risky patterns in snaglist.js, the pages, the worker and the tools | No HTML built from text and no eval. 24 general "object injection" warnings and 2 pattern warnings. | Each was read: every key is a fixed name or the site's own setting, so that rule is off; the patterns cannot backtrack and are marked with the reason |
| Semgrep | Semgrep's JavaScript, cross-site scripting and secrets rules, on the same files | Nothing | Nothing |
| Bandit | Risky patterns in the Python tool | Nothing | Nothing |
| ShellCheck | Mistakes in the shell scripts | 1: a `cd` that could fail silently | Fixed |
| OWASP ZAP | The demo and set-up pages, baseline and active | No failures. 7 warnings, all about the host's headers, the design system's style sheets and the demo's deliberate `?token=abc` request | Each explained in "Left as they are, on purpose" and marked in `tools/zap-rules.tsv` |
| CodeQL | GitHub's JavaScript security and quality queries, run here | 4: the table escaping (real, fixed, SEC-19, counted as one finding for its two lines), an unused list (removed), and the demo's Break something button, which fails on purpose | 0 real |

**On GitHub**, from 3 November 2026: CodeQL code scanning (JavaScript and Python, extended queries) runs on
every push, and secret scanning and push protection are on. The first CodeQL scan on GitHub, after the fixes,
raised 0 alerts, and secret scanning found nothing. Before that, CodeQL was run here with the same engine.

## Not tested yet

- Firefox and Safari: the tests run in Chrome only. The slow email pattern the reviewer found in Node may still
  matter there; it is bounded now, but there is no test in those browsers yet.
- The example worker on Cloudflare itself: its tests replace Cloudflare and GitHub with stand-ins.
- `beforeSend`, `context` and `component.from`: these run the site's own code, so what they add is the site's
  responsibility, and nothing checks it.

## Security checks for each release

Every release runs the checks below before it is tagged, and adds a row here. A release's notes list its
security fixes under Security.

| Release | Tests | Journeys | Security scans | CodeQL | Notes |
|---|---|---|---|---|---|
| 0.3.2 (not released yet; checked 3 November 2026) | 21 of 21 passed (19 IDs) | Passed, pictures retaken | Gitleaks 0, Trivy 0, ESLint 0, Semgrep 0, Bandit 0, ShellCheck 0, ZAP no failures (baseline and active) | Run here: 0 real alerts left. On GitHub: 0 alerts | First full check; see [the 0.3.2 notes](releases/v0.3.2.md) |
