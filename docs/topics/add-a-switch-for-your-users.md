[Help centre](../README.md) · Settings
<!-- help: use / settings -->

# Add a switch for your users

How-to

Let people turn off and turn on the 'Send feedback' button themselves, next to your other display or
accessibility settings.

## Steps

1. Add a switch to your settings page, with this label and hint:
   - Label: **Show Send feedback**
   - Hint: "A button for sending feedback or reporting a problem on any page. Reports never include your personal details."
2. Use a real switch, so screen readers announce it as on or off:

   ```html
   <button type="button" role="switch" aria-checked="true" id="snag-switch">Show Send feedback</button>
   ```

3. Connect it to Snaglist. Turning it off hides the button and remembers the choice in this browser:

   ```js
   const button = document.getElementById("snag-switch");
   button.setAttribute("aria-checked", String(Snaglist.isUserEnabled()));
   button.addEventListener("click", () => {
     const on = button.getAttribute("aria-checked") !== "true";
     button.setAttribute("aria-checked", String(on));
     Snaglist.setUserEnabled(on); // on again restarts Snaglist with the settings it had
   });
   ```

4. Turn off the switch, then turn it on again, and check the button goes and comes back.

## Things to note

- If your app has accounts, also save the choice with the account, and call
  `Snaglist.setUserEnabled(savedValue)` before `Snaglist.start()` on each page load. Then the choice follows the
  person to every device.
- To ignore people's choice, for example in a test build, set `userToggle: false`.

## Find out more

- [Turn off Send feedback](deactivate-send-feedback.md), the help for your users
- [Turn on or turn off Snaglist for everyone](activate-or-deactivate-snaglist.md)
