[Help centre](../README.md) · Settings

# Show Snaglist in your language

How-to

Snaglist's buttons and questions are in English by default, in British or US spelling. You can show them in any
language by giving your own text for each one.

## Steps

1. Set your site's main language with `language`. The default, `"auto"`, reads the `lang` attribute of each
   page:

   ```js
   Snaglist.start({ language: "en-US" });
   ```

   - `en-GB` and other English: British spelling (colour, behaviour).
   - `en-US`: US spelling (color, behavior), with nothing else to do.
   - Any other language: continue with step 2.
2. Get every piece of text Snaglist shows. Open a page that runs Snaglist, open the browser's developer
   console, and run:

   ```js
   copy(JSON.stringify(Snaglist.strings(), null, 2))
   ```

   This puts about 170 keys and their English text on your clipboard, such as `"launcher": "Send feedback"`.
3. Translate each value, keeping each key exactly as it is.
4. Give the translations to Snaglist as `text`, with the language code:

   ```js
   Snaglist.start({
     language: "es",
     text: { "launcher": "Enviar comentarios", "chooseTitle": "Enviar comentarios", "types.bug.label": "Algo no funciona" },
   });
   ```

5. Open the site and go through **Send feedback** to check every window.

## Things to note

- Any key you leave out stays in English, so you can translate a few at a time.
- For Arabic, Hebrew, Persian and Urdu, Snaglist's windows are laid out right to left.
- Reports themselves (the table and section headings) stay in English, so a team can read reports from any
  language site. What people enter stays in their own language.
- An AI assistant can translate them for you: the [set-up tool](use-the-set-up-tool.md) asks for your language and
  adds the step to its prompt. Ask a native speaker to check the result.

## Find out more

- [Settings reference](settings-reference.md)
