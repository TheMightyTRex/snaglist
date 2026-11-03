[Help centre](../README.md) · When something is wrong

# If Send feedback does not appear

Troubleshooting

The button is missing when Snaglist is not loaded, not started, or deactivated. Check each in turn.

## Steps

1. Open the browser's developer console on the page and enter `Snaglist`. If it says it is not defined, the
   file did not load: check the script tag's address opens the file.
2. Enter `Snaglist.isUserEnabled()`. If it says `false`, the button was deactivated in this browser. Type
   `Snaglist.setUserEnabled(true)`, then reload the page.
3. Check the `Snaglist.start()` call runs and has no `enabled: false`. With the script tag only, check it has
   `data-github`, `data-email`, `data-endpoint` or `data-start`.
4. Check the console for a Content Security Policy message. If there is one, read step 6 of
   [Host Snaglist on your own server](host-snaglist-on-your-own-server.md).
5. Check nothing on your page covers the corner the button sits in. To move it, set
   `launcher: "bottom-left"`, or set `launcher: false` and open it from your own menu with `Snaglist.open()`.

## Find out more

- [Add Snaglist to a website](add-snaglist-to-a-website.md)
- [Activate or deactivate Snaglist for everyone](activate-or-deactivate-snaglist.md)
