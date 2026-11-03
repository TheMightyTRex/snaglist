[Help centre](../README.md) · Reports

# Send reports by email

How-to

Reports open in the person's own mail app, addressed to you, with the subject and report filled in.

## Steps

1. Set the address and, if you like, the subject:

   ```js
   Snaglist.start({ send: { email: { to: "team@example.com", subject: "UX report" } } });
   ```

   With the script tag only, use `data-email="team@example.com"`.
2. Make a test report and select **Open in email**. Check the message in your mail app.

## Things to note

- The email comes from the person's own address, and 'What is sent' tells them so.
- Mail apps take a limited amount of text from a link. Long reports are shortened and the full report is put
  on the clipboard, with a note in the email to paste it.
- On a computer with no mail app set up, 'Open in email' does nothing. Keep 'Copy as Markdown' on
  (the default) as another way.

## Find out more

- [Send reports to GitHub](send-reports-to-github.md)
- [Send reports to your own server](send-reports-to-your-own-server.md)
