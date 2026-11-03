[Help centre](../README.md) · Add and set up · How-to

# Keep personal details out of reports

Snaglist never reads what people type, and hides anything that looks like an email, number or key. Mark the
parts of your pages that show personal details, so their text is never read either.

## Steps

1. Find every part of your pages that shows details about a person: account names, email addresses,
   messages, postal addresses, order numbers and payment details.
2. Add `data-snag-private` to each one:

   ```html
   <span data-snag-private>Signed in as Alex Example</span>
   ```

3. Report an issue on one of those parts and check that **Where** shows `[private]`.
4. If your app shows its own kinds of number, such as order references, hide them too:

   ```js
   Snaglist.start({ redact: [[/ORD-\d+/g, "[order]"]] });
   ```

## Things to note

- Check your script errors and console messages cannot contain personal details, as **Something is broken**
  reports include them. If they can, set `collect: { errors: false, console: false }`, or hide them with
  `redact`.
- If you use `beforeSend` to change reports, do not add personal details back in.
- If your own server stores reports, say so in your privacy notice.

## Find out more

- [What a report holds, and what it never holds](what-a-report-holds.md)
