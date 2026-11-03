[Help centre](../README.md) · Add and set up · How-to

# Name the parts of your pages

Reports say which component had the problem. Give your main parts clear names so a report says
`checkout-summary`, not `div`.

## Steps

1. Add a `data-component` attribute to each main part of your pages: the header, menus, forms, cards, tables
   and dialogs. Use the name the part has in your code:

   ```html
   <section class="panel" data-component="checkout-summary">
   ```

2. Report an issue on that part and check that **Where** shows the name.

## Things to note

- Snaglist looks for a name in this order: your own function (`component.from`), the nearest
  `data-component`, then the first plain class name, such as `card` or `btn`.
- To use another attribute you already have, such as `data-testid`, set
  `component: { attribute: "data-testid" }`.
- The part's role (button, link, field) and its label are added as well, so two buttons in the same component
  can still be told apart.

## Find out more

- [Keep personal details out of reports](keep-personal-details-out.md)
- [Settings reference](settings-reference.md)
