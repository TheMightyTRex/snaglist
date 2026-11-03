# Prompts for an AI coding assistant

Copy a prompt into your coding assistant (Claude Code, Copilot, Cursor or another) in your project. Change the
parts in angle brackets first.

## Add Snaglist, with a switch for users

```text
Add Snaglist (https://github.com/TheMightyTRex/snaglist) to this app so testers and users can report UX issues.

1. Download snaglist.js from https://raw.githubusercontent.com/TheMightyTRex/snaglist/main/snaglist.js into the
   folder this app serves static files from. Do not change it, so it can be updated by copying it again.
2. Load it on every page, after the page content, and start it once with:
     Snaglist.start({
       app: "<app name>",
       version: <the app's version variable>,
       enabled: <true only where reports are wanted, for example test builds or a feature flag>,
       send: { github: { repo: "<owner/repo>" } },
     });
   In a single-page app, start it once at the top level, not in a component that remounts.
3. Add data-component="<name>" to the main parts of each page (header, menus, forms, cards, tables, dialogs)
   so reports name them clearly. Use the component's name from the code.
4. Add data-snag-private to every element that shows personal details: account names, email addresses,
   messages, addresses, payment details.
5. Add a user setting, next to the app's other display or accessibility settings:
   - Label: "Show Report an issue"
   - Hint: "A button for telling us about a problem on any page. Reports never include your personal details."
   - Control: a switch (role="switch"), on by default, saved the way this app saves other settings
     (per account if the app has accounts).
   - Turning it off calls Snaglist.setUserEnabled(false); turning it on calls Snaglist.setUserEnabled(true)
     and then Snaglist.start() with the same settings as step 2.
   - On page load, call Snaglist.setUserEnabled(<the saved value>) before Snaglist.start().
6. Follow this app's own style for words, components and tests. Add a test that the button appears when the
   setting is on and is gone when it is off.
7. Tell me which files you changed and how to turn it off for everyone.
```

## Turn it off for everyone

```text
Turn off Snaglist everywhere in this app without removing it: find the Snaglist.start() call and set
enabled: false, or wrap the call in the feature flag <flag name>. Keep the user setting, but hide it while
Snaglist is turned off. Tell me where the switch is.
```

## Remove it completely

```text
Remove Snaglist from this app completely:
1. Delete snaglist.js and every <script> tag or import that loads it.
2. Delete the Snaglist.start(), Snaglist.setUserEnabled() and any other Snaglist calls.
3. Delete the "Show Report an issue" setting, its saved value and its tests.
4. Leave the data-component attributes (they are harmless and help tests), unless I say otherwise, and
   remove the data-snag-private attributes.
5. Search the whole project for "snaglist" and "snag-" to check nothing is left, and tell me what you removed.
```

## Record more for a test session

```text
For our test builds only, change the Snaglist settings to also record styles, script errors and the trail:
collect: { styles: true, errors: true, trail: true }. Use the categories preset "<ux, heuristics or wcag>".
Check that our error messages cannot contain personal details before turning on errors, and tell me if any can.
```
