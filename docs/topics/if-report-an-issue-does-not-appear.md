[Help centre](../README.md) · Troubleshooting · Troubleshooting

# If Report an issue does not appear

The button is missing when Snaglist is not loaded, not started, or turned off. Check each in turn.

## Steps

1. Open the browser's developer console on the page and type `Snaglist`. If it says it is not defined, the
   file did not load: check the script tag's address opens the file.
2. Type `Snaglist.isUserEnabled()`. If it says `false`, the button was turned off in this browser. Type
   `Snaglist.setUserEnabled(true)`, then reload.
3. Check the `Snaglist.start()` call runs and has no `enabled: false`. With the script tag only, check it has
   `data-github`, `data-email`, `data-endpoint` or `data-start`.
4. Check the console for a Content Security Policy message. If there is one, read step 6 of
   [Host Snaglist on your own server](host-snaglist-on-your-own-server.md).
5. Check nothing on your page covers the corner the button sits in. To move it, set
   `launcher: "bottom-left"`, or set `launcher: false` and open it from your own menu with `Snaglist.open()`.

## Find out more

- [Add Snaglist to a website](add-snaglist-to-a-website.md)
- [Turn Snaglist on or off for everyone](turn-snaglist-on-or-off-for-everyone.md)
