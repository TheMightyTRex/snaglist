[Help centre](../README.md) · When something is wrong
<!-- help: fix / problems -->

# If a report does not send

Troubleshooting

Each way of sending fails in its own way. Find yours on the chart, then follow its numbered answer, and keep
'Copy as Markdown' as a way that always works.

```flow
title: Find your answer
start: A report does not send
q: How were you sending it?
  Open in GitHub -> q2
  Open in email -> 3
  Send, to the site's server -> 4
  The computer is not online -> 5
q2: What happened?
  GitHub opened in this tab -> 1
  The report is empty -> 2
  Labels are missing -> send-reports-to-github.md
1: GitHub opens in the same tab #github-opens-in-the-same-tab
2: GitHub opens with an empty report #github-opens-with-an-empty-report
3: Open in email does nothing #open-in-email-does-nothing
4: Send says Not sent #send-says-not-sent
5: This computer is not online #this-computer-is-not-online
```

## GitHub opens in the same tab

The browser blocked a new tab, so Snaglist used this one. Use the browser's Back to return. To have a new tab, allow
pop-ups for the site.

## GitHub opens with an empty report

The report was too long for a web address and is on your clipboard. Paste it into the issue.

## Labels are missing on GitHub

GitHub only adds labels that exist, and only for people who may label issues. Read
[Send reports to GitHub](send-reports-to-github.md).

## Open in email does nothing

No mail app is set up on this computer. Use **Copy as Markdown** and paste the report into an email.

## Send says Not sent

The message after it gives the reason. A number such as 403 or 500 comes from the site's server; "Failed to fetch"
usually means the server did not allow the request from this site. Read step 3 of
[Send reports to your own server](send-reports-to-your-own-server.md).

## This computer is not online

Select **Show as a QR code** and scan it with your phone. Read
[Send a report with a QR code](send-a-report-with-a-qr-code.md).

## Find out more

- [Check what is sent, then send it](check-what-is-sent.md)
