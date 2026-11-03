[Help centre](../README.md) · Add and update

# Add Snaglist to a website

How-to

Add the 'Send feedback' button to every page of a website with one file and one line. The
[set-up tool](use-the-set-up-tool.md) writes this code for you, with your choices. This suits plain
HTML sites, WordPress themes, server-rendered apps and anything else that has HTML pages.

## Before you begin

- You can change your site's files and the HTML that every page shares, such as a layout or footer template.
- Decide where reports should go: [Send reports to GitHub](send-reports-to-github.md),
  [Send reports by email](send-reports-by-email.md) or
  [Send reports to your own server](send-reports-to-your-own-server.md).

## Steps

1. Download `snaglist.js` from the Snaglist repository. This command saves it in the current folder:

   ```bash
   curl -fsSLO https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/snaglist.js
   ```

2. Put `snaglist.js` in the folder your site serves files from, next to your other scripts.
3. Add this line to the shared HTML, immediately before `</body>`. Put your GitHub repository in place of
   `owner/repo`:

   ```html
   <script src="/snaglist.js" data-github="owner/repo" defer></script>
   ```

4. Publish the site and open any page. You will find **Send feedback** in a corner of the page.
5. Make a test report: [Report a problem with one thing on a page](send-feedback.md).

## Things to note

- For more settings than the script tag allows, start Snaglist yourself:

  ```html
  <script src="/snaglist.js"></script>
  <script>
    Snaglist.start({ app: "My site", version: "1.0.0", send: { github: { repo: "owner/repo" } } });
  </script>
  ```

- Snaglist reads nothing until someone selects 'Send feedback', and sends nothing until they choose to.
- To serve the file from your own server with the right headers, read
  [Host Snaglist on your own server](host-snaglist-on-your-own-server.md).

## If it does not work

Read [If Send feedback does not appear](if-send-feedback-does-not-appear.md).

## Find out more

- [Add Snaglist to a React, Vue, Svelte or other framework app](add-snaglist-to-a-framework-app.md)
- [Settings reference](settings-reference.md)
- [Remove Snaglist](remove-snaglist.md)
