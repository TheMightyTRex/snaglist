# Prompts for AI assistants

These prompts work with any AI assistant that can read and change your project's files, such as Claude,
ChatGPT, Gemini, Copilot, Cursor, Windsurf, Replit or Lovable. Copy the text between "Copy from here" and
"Copy to here", paste it into your assistant, and answer its questions.

Every prompt tells the assistant to check with you before it changes anything, and to say what it changed.

## Add Snaglist to my app

The quickest way is the [set-up tool](https://themightytrex.github.io/snaglist/configure.html): choose your settings
and it writes one prompt with everything in it. This general prompt asks your assistant to ask you instead.

Copy from here

```text
I want to add Snaglist to this project. Snaglist is a small, free script (MIT licence) that adds a "Send
feedback" button to every page. People use it to report bugs and UX problems, suggest features and
improvements, record a series of steps, or check the page for accessibility problems. Each report is tagged
with the page and the part of it, records the technical details needed to act on it, collects no personal
information, and is shown in full before it is sent.
Home page: https://github.com/TheMightyTRex/snaglist
Short instructions for AI tools: https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/llms.txt

Please do this:

1. Read llms.txt from the address above. If you cannot open web pages, use these steps.
2. Read my project and tell me in one or two sentences what kind of app it is, what it is built with, and
   where its shared page layout is. Then ask me these questions, all at once, and wait for my answers:
   a. Where should reports go: a GitHub repository (owner/name), an email address, or both?
   b. Should the button show for everyone, or only in testing (for example on a staging address)?
   c. Should users get a setting to deactivate the button? (Recommended: yes.)
   d. What is the app's name?
   e. What is the site's main language? (Snaglist is in English; for US English it uses US spelling; for any
      other language you will translate its text.)
   f. What should people be able to send? Offer these, all on by default. Problems: Something is broken (bug),
      Hard to use (ux), Looks wrong (visual), Hard to use with my tools or needs (accessibility), Slow
      (performance), Words are wrong (content). Suggestions: A new feature (feature), Make something better
      (idea), Something else (other). And: Check this page for accessibility problems (check).
3. Download https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/snaglist.js into the folder this
   app serves static files from (for example public/ or static/). Do not change the file.
4. Create snaglist-start.js in the same folder, which starts Snaglist with my answers once snaglist.js has
   loaded:
     (function start(tries) {
       if (!window.Snaglist) { if (tries < 100) setTimeout(start, 50, tries + 1); return; }
       Snaglist.start({
         app: "<the app's name>",
         language: "<the language code, for example en-GB, en-US or es>",
         enabled: <true, or a check that is only true in testing>,
         types: [<what I chose, for example "bug", "ux", "feature", "check">],
         send: { github: { repo: "<owner/name>" }, email: { to: "<email>" } },
       });
     })(0);
   Leave out github or email if I did not choose it.
5. Load both files on every page, snaglist.js first, immediately before the closing </body> tag of the shared layout:
     <script src="/snaglist.js" defer></script>
     <script src="/snaglist-start.js" defer></script>
   In a framework app, put them where its documentation says static scripts go (for example next/script in
   Next.js, or is:inline in Astro).
6. If the main language is not English, run Snaglist.strings() (or read the TEXT, TYPES, GROUPS, SEVERITIES,
   PARTS and RULES lists in snaglist.js) to get every key and its English text, translate each value into
   natural, plain language, and add them to Snaglist.start() as text: { "key": "translation" }. Keep the keys
   exactly as they are. Tell me to have a native speaker check them.
7. Add data-component="<name>" to the main parts of each page (header, menus, forms, cards, tables, dialogs),
   using each part's name from the code.
8. Add the attribute data-snag-private to every element that shows personal details, such as the signed-in
   user's name or email, messages, addresses or payment details.
9. If I said yes to a setting, add one next to the app's other settings:
   - Label: "Show Send feedback"
   - Hint: "A button for sending feedback or reporting a problem on any page. Reports never include your
     personal details."
   - A switch, on by default. Deactivating it calls Snaglist.setUserEnabled(false); activating it calls
     Snaglist.setUserEnabled(true). Save the choice the way this app saves other settings.
10. Do not put any password, token or API key in the page. Snaglist does not need one.
11. When you have finished, tell me:
   - every file you changed or added,
   - how to try it: open a page, select "Send feedback", choose what to send, and follow it through to
     "Review what is sent",
   - how to deactivate it for everyone (set enabled: false),
   - how to remove it (the prompt "Remove Snaglist from my app").
```

Copy to here

## Fix the accessibility problems Snaglist found

Paste one or more reports from **Check this page for accessibility problems** after the prompt, or give the
assistant the GitHub issues' addresses.

Copy from here

```text
These are accessibility problems found on this site by Snaglist's automatic check. Each one gives the WCAG
criterion, why it matters, how to fix it with example code, and where it is (a CSS selector and the part).
Fix guide: https://github.com/TheMightyTRex/snaglist/blob/main/docs/topics/fix-common-accessibility-problems.md

Please:
1. For each problem, find the code that makes that element, using the selector and the part's description.
   If a selector matches nothing, search for the text or component instead, and tell me.
2. Fix it in the source, the way the fix guide says, in this project's own style and components. Fix the
   component once rather than each page that uses it.
3. Write any new text (alt text, labels, link words) in plain language that says what the thing is or does.
   Ask me when you cannot tell what a picture shows.
4. Do not hide problems: never add aria-hidden, role="presentation" or empty alt to something meaningful only
   to pass the check.
5. Tell me every file you changed, and which problems you could not fix and why.
6. Remind me to run the check again, and to try the pages with a keyboard only and a screen reader.

The problems:
<paste the reports here>
```

Copy to here

## Translate Snaglist into my language

Copy from here

```text
Please translate Snaglist's interface in this project into <language>.
1. Find where Snaglist.start() is called (often in snaglist-start.js).
2. Get every piece of Snaglist's text: read the TEXT, TYPES, GROUPS, SEVERITIES, PARTS and RULES lists in
   snaglist.js, or tell me to run copy(JSON.stringify(Snaglist.strings(), null, 2)) in the browser console and
   paste the result to you.
3. Translate each value into natural, plain <language>, short enough for a button where it is a button. Keep each
   key exactly as it is.
4. Add language: "<language code>" and text: { "key": "translation", ... } to Snaglist.start().
5. Tell me to open the site, go through Send feedback, and have a native speaker check the words.
```

Copy to here

## Remove Snaglist from my app

Copy from here

```text
Please remove Snaglist (https://github.com/TheMightyTRex/snaglist) from this project completely.

1. Search the whole project, ignoring dependency folders, for "snaglist", "Snaglist" and "snag-". Show me the
   list of files and lines, and wait for me to say yes before changing anything.
2. Then:
   - delete the snaglist.js and snaglist-start.js files,
   - delete every <script> tag or import that loads it,
   - delete every Snaglist.start(), Snaglist.setUserEnabled() and other Snaglist call,
   - delete the "Show Send feedback" setting, its saved value and its tests, if there is one,
   - delete the data-snag-private attributes,
   - keep the data-component attributes unless I ask you to remove them; they do nothing on their own.
3. Search again and confirm nothing is left.
4. Tell me every file you changed, and that reports already sent (GitHub issues or emails) are not affected.
```

Copy to here

## Deactivate Snaglist for now

Copy from here

```text
Please deactivate Snaglist in this project without removing it. Find the Snaglist.start() call (often in
snaglist-start.js, or the <script> tag with data-github or data-email) and set enabled: false, so the "Send feedback" button no longer
shows. If there is a "Show Send feedback" user setting, hide it while Snaglist is off. Tell me which line to
change to activate it again.
```

Copy to here

## Record more during a test session

Copy from here

```text
For a test session, please change the Snaglist settings in this project so every report records all the
technical details, whatever its type: add collect: { styles: true, layout: true, a11y: true, html: true,
performance: true, errors: true, console: true, network: true, trail: true } to Snaglist.start(), and offer
every report type. Before you do, check whether this app's error messages, console messages or request paths
could include personal details (names or emails; query strings and ids in paths are already removed) and tell
me if any could. Only activate this where enabled is true for testing, and tell me how to go back to the
defaults.
```

Copy to here

## Check Snaglist is set up well

Copy from here

```text
Please check how Snaglist is set up in this project, without changing anything, and tell me:
1. Which version it is (the VERSION line near the start of snaglist.js) and whether
   https://github.com/TheMightyTRex/snaglist/releases has a newer one.
2. Where it is started, and with which settings.
3. Any element that shows personal details (names, emails, addresses, messages, payment details) and has no
   data-snag-private attribute.
4. Main parts of pages (header, menus, forms, cards, tables, dialogs) with no data-component attribute.
5. Any token, password or key near the Snaglist code, which should not be there.
List what to fix, most important first.
```

Copy to here
