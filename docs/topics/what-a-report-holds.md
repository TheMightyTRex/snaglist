[Help centre](../README.md) · Settings

# What a report holds, and what it never holds

Reference

Snaglist is built so that a report says what is wrong and where, and nothing about who found it.

## Never collected

- Anything entered in the page's fields, including search boxes and passwords. A field is named by its label,
  and a recorded step says "Entered text in field Your name", never the
  text.
- What was typed into an editable area (`contenteditable`), such as a rich text editor, even when the part chosen
  holds it.
- The choice made in a field: the option chosen in a list, which tick boxes and radio buttons were selected, or
  which suggestion was picked. A recorded step says "Made a choice in Title", never the choice.
- The text of anything other than the part the person chose and the page's own messages. The person is shown that
  text in full before sending and can take it out.
- Anything inside an element marked `data-snag-private`.
- Cookies, local storage (other than Snaglist's own on and off switch), session ids or tokens.
- The query string and the hash of the address, unless you list safe parameters in `page.keepParams`.
- The full browser identification string: only the browser and system family and the browser's main version.
- The IP address: Snaglist runs in the browser and sends nothing by itself. GitHub, the mail app or your
  server receives what it always receives when someone uses it.

## Technical details, and how they are cleaned

For some kinds of report, Snaglist adds technical details that developers need. Each is cleaned first:

| Detail | What is kept | What is taken out |
|---|---|---|
| Failed and slow requests | Method, path, status and time | The query string, the hash, ids in the path, headers and bodies |
| Script errors | The message and three lines of stack | Query strings and hashes of any address, and site addresses in file names; emails, numbers and keys in messages |
| Console messages | Errors and warnings, on one line | Query strings and hashes of any address; the values in a logged object (only its keys are kept); emails, numbers and keys; anything over 300 characters |
| The part's HTML | Tags and safe attributes such as `class`, `role` and `aria-*`, with emails, numbers and keys replaced | Every bit of text (shown as `…(12)`, its length), field values, values such as `aria-valuetext`, everything after `tel:`, `mailto:` and the like in a link, and any other attribute |
| What was done before, and recorded steps | The component and label of each thing selected, changed or sent; pages gone to; errors and failed requests | What was entered, and anything marked private |
| Text on screen | The visible text of the part chosen (up to 300 characters) and messages the page is showing, such as errors | Field values, anything marked private; emails, numbers and keys are replaced |
| Page speed and device | Timings, memory, connection type, screen size | Nothing personal is read |

These are kept in memory on the page only, and only leave it when someone sends a report.

## Hidden before anyone reads it

These are replaced in the description, labels, page name, paths and script errors:

| In the form of | Becomes |
|---|---|
| An email address | `[email]` |
| A phone or card number, or any long number | `[number]` |
| An IP address | `[address]` |
| A UUID | `[id]` |
| A key or token (GitHub, Slack, Stripe-style and AWS keys, JSON web tokens, long random strings, and anything after `token=`, `password:`, `session=`, `Authorization:` and the like) | `[key]` |
| A number, UUID or long id in the path | `:id` |

Add your own with `redact: [[/pattern/g, "[label]"]]`.

## The person is shown everything first

Before anything is sent, Snaglist shows the whole report, exactly as it will be sent, with this statement:

> This report keeps no account, cookies or anything entered in the page's fields, and anything in the form of an
> email, a long number or a key is replaced. The page title and the text on screen are copied as they are, so
> check they show nothing personal.

They can untick any part of the technical details (for example the console, requests or the page's HTML)
and the preview changes at once. Nothing is sent until they choose a way to send it.

## What each way of sending reveals

| Way | Who can identify the person |
|---|---|
| GitHub | The person posts the issue from their own account, so GitHub shows their user name. The review says so |
| Email | The email comes from their own address. The review says so |
| Your server | Your server receives the request, without cookies or referrer. What it stores is up to you |
| Copy and Download | Nobody: the report stays with the person |

## What site owners need to do

- Mark parts of your pages that show personal details with `data-snag-private`: read
  [Keep personal details out of reports](keep-personal-details-out.md).
- If your page titles hold the signed-in person's name, give Snaglist another name for the page with
  `page: { name: () => "Inbox" }`. The title and the text on screen are copied as they are.
- Only activate `errors` if your error messages do not include personal details.
- If you use `beforeSend`, do not add personal details back in.
- If your server stores reports, say so in your own privacy notice.
