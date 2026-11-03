[Help centre](../README.md) · Add and set up · How-to

# Add Snaglist to a React, Vue, Svelte or other framework app

In an app built with a framework, load `snaglist.js` as a plain file and start it once, when the app first
loads. Snaglist keeps its own element outside your components, so your framework never redraws it.

## Before you begin

- Download `snaglist.js`, as in step 1 of [Add Snaglist to a website](add-snaglist-to-a-website.md).

## Steps

1. Put `snaglist.js` in the folder your framework copies as it is, usually `public/` (React with Vite, Vue,
   Next.js, Astro) or `static/` (SvelteKit).
2. Load it in the page's HTML shell (`index.html`, or your root layout), before the closing `</body>`:

   ```html
   <script src="/snaglist.js" defer></script>
   ```

3. Start it once, in the code that runs when the app loads, not inside a component that can appear twice.
   In React, for example, in `main.jsx` after the app is mounted:

   ```js
   window.addEventListener("load", () => {
     window.Snaglist?.start({
       app: "My app",
       version: import.meta.env.VITE_APP_VERSION,
       enabled: import.meta.env.MODE !== "production",
       send: { github: { repo: "owner/repo" } },
     });
   });
   ```

4. Run your app and check that **Report an issue** appears.

## Things to note

- Snaglist reads the address each time someone reports, so page changes inside a single-page app are picked
  up without anything extra.
- With TypeScript, add `declare global { interface Window { Snaglist?: any } }` to a types file.
- To name components clearly in reports, read [Name the parts of your pages](name-the-parts-of-your-pages.md).

## Find out more

- [Turn Snaglist on or off for everyone](turn-snaglist-on-or-off-for-everyone.md)
- [Use an AI assistant to add Snaglist](use-an-ai-assistant-to-add-snaglist.md)
