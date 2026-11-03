[Help centre](../README.md) · Add and update

# Remove Snaglist

How-to

Snaglist keeps everything in one file, one element and one saved setting, so removing it leaves nothing
behind.

## Steps

1. Delete the `<script>` tag that loads `snaglist.js` from your pages, and any `Snaglist.start()` call.
2. Delete any other Snaglist code: your users' switch ([Add a switch for your users](add-a-switch-for-your-users.md))
   and any `Snaglist.` calls.
3. Delete `snaglist.js` and `snaglist-start.js` (if you made one with the set-up tool) from your site's files.
4. Remove the `data-snag-private` attributes. Keep the `data-component` attributes if they help your tests;
   they do nothing on their own.
5. Search your project for `snaglist` and `snag-` to check nothing is left. With Git, this command lists any
   file that still mentions it:

   ```bash
   git grep -n -i -e snaglist -e "snag-"
   ```

6. Publish your site and check that **Send feedback** has gone.

## Things to note

- Each browser that used it keeps one small setting, `snaglist:off`, only if the person deactivated the button.
  To clear it while Snaglist is still installed, run `Snaglist.destroy({ forget: true })` on the page first.
- Reports already sent stay where they went: GitHub issues, emails or your server.
- To stop it for a while without removing it, read
  [Activate or deactivate Snaglist for everyone](activate-or-deactivate-snaglist.md).

## Find out more

- [Take Snaglist out of your site](../guides/take-snaglist-out-of-your-site.md)
