[Help centre](../README.md) · When something is wrong
<!-- help: fix / problems -->

# If Send feedback does not appear

Troubleshooting

The button is missing when Snaglist is not loaded, not started, or turned off. Find what the browser's developer
console says on the chart, then follow its numbered answer.

```flow
title: Find your answer
start: The Send feedback button does not appear
q: What does the console say when you enter Snaglist?
  It is not defined -> 1
  It is there -> q2
q2: What does Snaglist.isUserEnabled() say?
  false -> 2
  true -> q3
q3: Is there a Content Security Policy message?
  Yes -> 4
  No -> 3
1: The file did not load #the-file-did-not-load
2: It was off in this browser #it-was-off-in-this-browser
3: Check that Snaglist starts #check-that-snaglist-starts
  Still missing -> 5
4: A Content Security Policy blocks it #a-content-security-policy-blocks-it
5: Something covers the button #something-covers-the-button
```

## The file did not load

Open the browser's developer console on the page and enter `Snaglist`. If it says it is not defined, the file did not
load: check the script tag's address opens the file.

## It was off in this browser

Enter `Snaglist.isUserEnabled()`. If it says `false`, the button was off in this browser. Type
`Snaglist.setUserEnabled(true)`, then reload the page.

## Check that Snaglist starts

Check the `Snaglist.start()` call runs and has no `enabled: false`. With the script tag only, check it has
`data-github`, `data-email`, `data-endpoint` or `data-start`.

## A Content Security Policy blocks it

Check the console for a Content Security Policy message. If there is one, read step 6 of
[Host Snaglist on your own server](host-snaglist-on-your-own-server.md).

## Something covers the button

Check nothing on your page covers the corner the button sits in. To move it, set `launcher: "bottom-left"`, or set
`launcher: false` and open it from your own menu with `Snaglist.open()`.

## Find out more

- [Add Snaglist to a website](add-snaglist-to-a-website.md)
- [Turn on or turn off Snaglist for everyone](activate-or-deactivate-snaglist.md)
