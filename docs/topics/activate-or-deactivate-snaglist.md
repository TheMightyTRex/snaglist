[Help centre](../README.md) · Settings

# Activate or deactivate Snaglist for everyone

How-to

You decide where Snaglist runs: everywhere, only in test builds, or nowhere for now. Deactivating it keeps it
installed, ready to activate again.

## Steps

1. Find the `Snaglist.start()` call, or the `<script>` tag with `data-github`.
2. To deactivate it, set `enabled: false`:

   ```js
   Snaglist.start({ enabled: false, send: { github: { repo: "owner/repo" } } });
   ```

3. To run it only in some builds, set `enabled` from your build's settings or a feature flag:

   ```js
   Snaglist.start({ enabled: window.location.hostname.startsWith("staging."), send: { github: { repo: "owner/repo" } } });
   ```

4. Publish the change and check the button has gone, or appears only where you meant.

## Things to note

- With the script tag only, remove the `data-github`, `data-email` and `data-endpoint` attributes to stop it
  starting.
- To deactivate it on a running page, for example from your own admin menu, call `Snaglist.destroy()`.
- Your users can also deactivate it for themselves: read [Add a switch for your users](add-a-switch-for-your-users.md).

## Find out more

- [Remove Snaglist](remove-snaglist.md)
