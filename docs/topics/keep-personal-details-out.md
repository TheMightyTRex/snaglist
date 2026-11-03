[Help centre](../README.md) · Settings

# Keep personal details out of reports

How-to

Snaglist never reads what people enter, and hides anything in the form of an email, number or key. It copies the
text of the part someone chooses, so mark the parts of your pages that show personal details, and their text is
never read.

## Steps

1. Find every part of your pages that shows details about a person: account names, email addresses,
   messages, postal addresses, order numbers and payment details.
2. Add `data-snag-private` to each one:

   ```html
   <span data-snag-private>Signed in as Alex</span>
   ```

3. Send feedback about one of those parts and check that **Where** shows `[private]`.
4. If your app shows its own kinds of number, such as order references, hide them too:

   ```js
   Snaglist.start({ redact: [[/ORD-\d+/g, "[order]"]] });
   ```

## Things to note

- Check your script errors and console messages cannot contain personal details, as 'Something is broken'
  reports include them. If they can, set `collect: { errors: false, console: false }`, or hide them with
  `redact`.
- If you use `beforeSend` to change reports, do not add personal details back in.
- If your own server stores reports, say so in your privacy notice.

## Find out more

- [What a report holds, and what it never holds](what-a-report-holds.md)
