[Help centre](../README.md) · Add and update

# Update Snaglist

How-to

Snaglist is one file, so updating means replacing it. Your settings stay in your own code and are kept.

## Steps

1. Read what changed in the [releases](https://github.com/TheMightyTRex/snaglist/releases) (opens in a new tab).
2. Download the new version over the old file. Put the version you want in place of `v0.4.0`:

   ```bash
   curl -fsSL -o snaglist.js https://raw.githubusercontent.com/TheMightyTRex/snaglist/v0.4.0/snaglist.js
   ```

3. Publish your site, then open a page and make a test report.
4. To check which version a page runs, enter `Snaglist.version` in the browser's developer console.

## Things to note

- If you load it from a content delivery network, change the version in the address instead.
- Browsers may keep the old file until their cache runs out. Adding `?v=0.4.0` (the new version) to the script's address makes
  them fetch the new one.

## Find out more

- [Host Snaglist on your own server](host-snaglist-on-your-own-server.md)
