[Help centre](../README.md) · Before you add Snaglist

# Run the demo on your computer

How-to

The demo page is a made-up app with Snaglist and a settings panel. Run it on your own computer to try changes
before you add Snaglist to your site. To try it without installing anything, open the
[online demo](https://themightytrex.github.io/snaglist/) instead.

## Before you begin

- Git and Python 3. Most Linux and Mac computers have both. On Windows, install them from git-scm.com and
  python.org (each opens in a new tab).

## Steps

1. Copy the Snaglist repository to your computer:

   ```bash
   git clone https://github.com/TheMightyTRex/snaglist.git
   ```

2. Go into its folder:

   ```bash
   cd snaglist
   ```

3. Start a small web server on your own computer only:

   ```bash
   python3 -m http.server 8777 --bind 127.0.0.1
   ```

4. Open http://127.0.0.1:8777/ in your browser. You will find the made-up app, with **Send feedback**, and
   **Settings** beside it.
5. Change any setting. **Send feedback** restarts with it, and **Your code** shows the code to copy.
6. To stop the server, go back to the terminal and press Ctrl and C together.

## Things to note

- The demo loads the design system's styles from the internet. Without a connection it still works, in plain
  colours.
- Reports from the demo go to the Snaglist repository with the `demo` label. Change the repository in
  'Send to' to send them to your own.

## Find out more

- [Add Snaglist to a website](add-snaglist-to-a-website.md)
