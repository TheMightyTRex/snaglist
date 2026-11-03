[Help centre](../README.md) · Reference · Reference

# What a report holds, and what it never holds

Snaglist is built so that a report says what is wrong and where, and nothing about who found it.

## Never collected

- Anything typed into the page's fields, including search boxes and passwords. A field is named by its label.
- The text of whole areas, such as a list of messages or a profile card. Only things whose text is a label
  (buttons, links, headings, field labels, table headings) are named.
- Anything inside an element marked `data-snag-private`.
- Cookies, local storage (other than Snaglist's own on and off switch), session ids or tokens.
- The query string and the hash of the address, unless you list safe parameters in `page.keepParams`.
- The full browser identification string: only the browser and system family and the browser's main version.
- The IP address: Snaglist runs in the browser and sends nothing by itself. GitHub, the mail app or your
  server sees what they always see when someone uses them.

## Technical details, and how they are cleaned

For some kinds of report, Snaglist adds technical details that developers need. Each is cleaned first:

| Detail | What is kept | What is taken out |
|---|---|---|
| Failed and slow requests | Method, path, status and time | The query string, the hash, ids in the path, headers and bodies |
| Script errors | The message and three lines of stack | Query strings and site addresses in file names; emails, numbers and keys in messages |
| Console messages | Errors and warnings | Emails, numbers and keys; anything over 300 characters |
| The part's HTML | Tags and safe attributes such as `class`, `role` and `aria-*` | Every bit of text (shown as `…(12)`, its length), field values, and any other attribute |
| What was done before | The component and label of each thing selected, changed or sent | What was typed, and anything marked private |
| Page speed and device | Timings, memory, connection type, screen size | Nothing personal is read |

These are kept in memory on the page only, and only leave it when someone sends a report.

## Hidden before anyone sees it

These are replaced in the description, labels, page name, paths and script errors:

| Looks like | Becomes |
|---|---|
| An email address | `[email]` |
| A phone or card number, or any long number | `[number]` |
| An IP address | `[address]` |
| A UUID | `[id]` |
| A key or token (GitHub, Slack, Stripe-style keys, JSON web tokens, long random strings) | `[key]` |
| A number, UUID or long id in the path | `:id` |

Add your own with `redact: [[/pattern/g, "[label]"]]`.

## The person sees everything first

Before anything is sent, Snaglist shows the whole report, exactly as it will be sent, with this statement:

> No personal information is kept in this report: no name, email, account, address, cookies or anything typed
> into the page's fields.

They can untick any part of the technical details (for example the console, requests or the page's HTML)
and the preview changes at once. Nothing is sent until they choose a way to send it.

## What each way of sending reveals

| Way | Who sees the person |
|---|---|
| GitHub | The person posts the issue from their own account, so GitHub shows their user name. The review says so |
| Email | The email comes from their own address. The review says so |
| Your server | Your server sees the request, without cookies or referrer. What it stores is up to you |
| Copy and Download | Nobody: the report stays with the person |

## What site owners need to do

- Mark parts of your pages that show personal details with `data-snag-private`: read
  [Keep personal details out of reports](keep-personal-details-out.md).
- Only turn on `errors` if your error messages do not include personal details.
- If you use `beforeSend`, do not add personal details back in.
- If your server stores reports, say so in your own privacy notice.
