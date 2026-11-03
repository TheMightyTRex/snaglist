# Prompts for AI assistants

These prompts work with any AI assistant that can read and change your project's files, such as Claude,
ChatGPT, Gemini, Copilot, Cursor, Windsurf, Replit or Lovable. Copy the text between "Copy from here" and
"Copy to here", paste it into your assistant, and answer its questions.

Every prompt tells the assistant to check with you before it changes anything, and to say what it changed.

## Add Snaglist to my app

Copy from here

```text
I want to add Snaglist to this project. Snaglist is a small, free script that puts a "Report an issue"
button on every page. People choose the part of the page with a problem, describe it, check exactly what
will be sent, and send it as a GitHub issue or an email. It collects no personal information.
Home page: https://github.com/TheMightyTRex/snaglist
Short instructions for AI tools: https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/llms.txt

Please do this:

1. Read llms.txt from the address above. If you cannot open web pages, use the steps below.
2. Look at my project and tell me in one or two sentences what kind of app it is and where its shared page
   layout is. Then ask me these questions, all at once, and wait for my answers:
   a. Where should reports go: a GitHub repository (owner/name), an email address, or both?
   b. Should the button show for everyone, or only in testing (for example on a staging address)?
   c. Should users get a setting to turn the button off? (Recommended: yes.)
   d. What is the app's name?
3. Download https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/snaglist.js into the folder this
   app serves static files from (for example public/ or static/). Do not change the file.
4. Load it once on every page, just before the closing </body> tag of the shared layout, with:
     <script src="/snaglist.js"></script>
   Then start it once, when the app has loaded, with my answers:
     Snaglist.start({
       app: "<the app's name>",
       enabled: <true, or a check that is only true in testing>,
       send: { github: { repo: "<owner/name>" }, email: { to: "<email>" } },
     });
   Leave out github or email if I did not choose it. In a framework app (React, Vue, Svelte, Next.js and
   others), start it in the code that runs once when the app loads, never inside a component.
5. Add data-component="<name>" to the main parts of each page (header, menus, forms, cards, tables, dialogs),
   using each part's name from the code.
6. Add the attribute data-snag-private to every element that shows personal details, such as the signed-in
   user's name or email, messages, addresses or payment details.
7. If I said yes to a setting, add one next to the app's other settings:
   - Label: "Show Report an issue"
   - Hint: "A button for telling us about a problem on any page. Reports never include your personal details."
   - A switch, on by default. Turning it off calls Snaglist.setUserEnabled(false); turning it on calls
     Snaglist.setUserEnabled(true). Save the choice the way this app saves other settings.
8. Do not put any password, token or API key in the page. Snaglist does not need one.
9. When you have finished, tell me:
   - every file you changed or added,
   - how to try it: open a page, select "Report an issue", choose something, fill in the form, and select
     "Review what is sent",
   - how to turn it off for everyone (set enabled: false),
   - how to remove it (the prompt "Remove Snaglist from my app").
```

Copy to here

## Remove Snaglist from my app

Copy from here

```text
Please remove Snaglist (https://github.com/TheMightyTRex/snaglist) from this project completely.

1. Search the whole project, ignoring dependency folders, for "snaglist", "Snaglist" and "snag-". Show me the
   list of files and lines, and wait for me to say yes before changing anything.
2. Then:
   - delete the snaglist.js file,
   - delete every <script> tag or import that loads it,
   - delete every Snaglist.start(), Snaglist.setUserEnabled() and other Snaglist call,
   - delete the "Show Report an issue" setting, its saved value and its tests, if there is one,
   - delete the data-snag-private attributes,
   - keep the data-component attributes unless I ask you to remove them; they do nothing on their own.
3. Search again and confirm nothing is left.
4. Tell me every file you changed, and that reports already sent (GitHub issues or emails) are not affected.
```

Copy to here

## Turn Snaglist off for now

Copy from here

```text
Please turn off Snaglist in this project without removing it. Find the Snaglist.start() call (or the
<script> tag with data-github or data-email) and set enabled: false, so the "Report an issue" button no longer
shows. If there is a "Show Report an issue" user setting, hide it while Snaglist is off. Tell me which line to
change to turn it back on.
```

Copy to here

## Record more during a test session

Copy from here

```text
For a test session, please change the Snaglist settings in this project so reports also record the chosen
part's styles, script errors and the last things selected: add collect: { styles: true, errors: true,
trail: true } to Snaglist.start(). Before turning on errors, check whether this app's error messages could
include personal details (names, emails, ids) and tell me if any could. Only turn this on where enabled is
true for testing, and tell me how to turn it off again.
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
