[Help centre](../README.md) · Run, update and remove · How-to

# Host Snaglist on your own server

Serve `snaglist.js` from your own server, so your pages load nothing from anyone else and you choose when to
update.

## Before you begin

- A web server that serves your site's files, such as nginx, Apache, Caddy, or your app's own static folder.

## Steps

1. Download the version you want into the folder your server serves. This command saves version 0.1.0:

   ```bash
   curl -fsSL -o snaglist.js https://raw.githubusercontent.com/TheMightyTRex/snaglist/v0.1.0/snaglist.js
   ```

2. Check it downloaded in full. The file ends with `})();`:

   ```bash
   tail -c 20 snaglist.js
   ```

3. Serve it as JavaScript. Most servers do this already for `.js` files.
4. Let browsers keep it for a while. For nginx, this rule keeps it for a day:

   ```nginx
   location = /snaglist.js { add_header Cache-Control "public, max-age=86400"; }
   ```

5. Add the script tag to your pages: [Add Snaglist to a website](add-snaglist-to-a-website.md).
6. If your site sends a Content Security Policy, allow Snaglist's styles. It adds them in its own shadow root,
   so `style-src` needs `'unsafe-inline'`. It needs no other site and no inline script.

## Things to note

- You can load it from a content delivery network instead, pinned to a version, but that site then sees your
  visitors' requests:

  ```html
  <script src="https://cdn.jsdelivr.net/gh/TheMightyTRex/snaglist@v0.1.0/snaglist.js" defer></script>
  ```

- To take reports on your own server too, read
  [Send reports to your own server](send-reports-to-your-own-server.md).

## Find out more

- [Set up Snaglist on your own server](../guides/set-up-snaglist-on-your-own-server.md)
- [Update Snaglist](update-snaglist.md)
