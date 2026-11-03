[Help centre](../README.md) · Add and set up · How-to

# Choose what a report records

Every report holds the person's description, the kind of issue and how bad it is. You choose what else it
records, from seven parts.

## Steps

1. Decide which parts you need. The defaults suit most sites:

   | Part | What it adds | Default |
   |---|---|---|
   | `page` | The page's name and its path, with ids as `:id` and no query or hash | On |
   | `element` | The part chosen: component, role, label, a CSS selector and its size | On |
   | `styles` | Its font size and weight, colours and their contrast ratio | Off |
   | `environment` | Viewport, zoom, browser and system family, language | On |
   | `display` | Theme, text size, reduced motion, more contrast, forced colours | On |
   | `errors` | The last five script errors on the page | Off |
   | `trail` | The last five things selected on the page | Off |

2. Set them in `collect`, leaving out any you keep as they are:

   ```js
   Snaglist.start({ collect: { styles: true, trail: true } });
   ```

3. Make a test report and check the preview in **What is sent**.

## Things to note

- `styles` is the quickest way to find low contrast: it measures the text against its background.
- `errors` and `trail` start recording when Snaglist starts, not when someone reports, so turn them on before
  the session that needs them.
- People can still untick any part in **What is sent** before they send it.
- To name a page yourself, set `page: { name: () => "Checkout, step 2" }`. To keep a safe query parameter,
  such as a tab name, set `page: { keepParams: ["tab"] }`.

## Find out more

- [Keep personal details out of reports](keep-personal-details-out.md)
- [Settings reference](settings-reference.md)
