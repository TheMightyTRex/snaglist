[Help centre](../README.md) · Accessibility

# Fix common accessibility problems

Reference

How to fix each problem Snaglist's accessibility check finds, with code before and after. Seven of them are
broken on purpose on the [demo page](https://themightytrex.github.io/snaglist/), under **Accessibility problems
to find** and in the line of faint text, so you can try the check and the fix.

To have an AI assistant fix them for you, use the prompt **Fix the accessibility problems Snaglist found** in
[Prompts for AI assistants](../AI-PROMPTS.md).

<!-- Made by tools/fix-guide.py from the rules in snaglist.js. Change the rules there, then run it again. -->

## Pictures with no text alternative

WCAG 1.1.1 Non-text content, level A. Impact: serious. Rule `image-alt`.

**Why it matters:** Screen reader users hear nothing, or the file name, instead of what the picture shows.

**How to fix it:** Add alt text that says what the picture shows. For a picture that is only decoration, use an empty alt.

Before:

```html
<img src="cover.jpg">
```

After:

```html
<img src="cover.jpg" alt="Cover of The Glass Harbour">
<img src="divider.svg" alt="">
```

## Buttons and links with no name

WCAG 4.1.2 Name, role, value, level A. Impact: critical. Rule `control-name`.

**Why it matters:** Screen readers announce only "button" or "link", so people cannot tell what it does.

**How to fix it:** Give every button and link a name: visible words, or an aria-label when it shows only an icon.

Before:

```html
<button><svg>…</svg></button>
```

After:

```html
<button aria-label="Close the menu"><svg aria-hidden="true">…</svg></button>
```

## Fields with no label

WCAG 1.3.1 Info and relationships, 3.3.2 Labels or instructions, level A. Impact: critical. Rule `field-label`.

**Why it matters:** People using a screen reader or voice control cannot tell what to type, and a placeholder disappears as soon as they type.

**How to fix it:** Give every field a visible label joined to it with for and id.

Before:

```html
<input type="email" placeholder="Email">
```

After:

```html
<label for="email">Email</label>
<input type="email" id="email" autocomplete="email">
```

## Text with too little contrast

WCAG 1.4.3 Contrast (minimum), level AA. Impact: serious. Rule `contrast`.

**Why it matters:** Faint text is hard or impossible to read for people with low vision, and for everyone in bright light.

**How to fix it:** Make text at least 4.5 to 1 against its background, or 3 to 1 for large text (24px, or 18.66px bold). Use a darker text colour or a stronger background.

Before:

```css
.summary { color: #9aa3b0; }  /* 2.4:1 on white */
```

After:

```css
.summary { color: #424b5b; }  /* 8.9:1 on white */
```

## Controls smaller than 24 by 24 pixels

WCAG 2.5.8 Target size (minimum), level AA. Impact: moderate. Rule `target-size`.

**Why it matters:** Small targets are hard to hit for people with tremors, on touch screens, and for anyone in a hurry.

**How to fix it:** Make buttons, links in menus and other controls at least 24 by 24 pixels (44 is better), or leave space around them.

Before:

```html
<button class="icon">⚙</button>  /* 18 × 18 */
```

After:

```html
.icon { min-width: 44px; min-height: 44px; }
```

## Headings out of order

WCAG 1.3.1 Info and relationships, 2.4.6 Headings and labels, level AA. Impact: moderate. Rule `headings`.

**Why it matters:** Screen reader users move around a page by its headings. A missing main heading or a skipped level makes the page hard to follow.

**How to fix it:** Give each page one h1, then go down one level at a time: h2 for sections, h3 inside them. Style headings with CSS, not by choosing the level.

Before:

```html
<h1>My books</h1>
<h4>Following</h4>
```

After:

```html
<h1>My books</h1>
<h2>Following</h2>
```

## Page language not set

WCAG 3.1.1 Language of page, level A. Impact: serious. Rule `page-language`.

**Why it matters:** Screen readers choose their voice and pronunciation from the page's language. Without it, words can be read out wrongly.

**How to fix it:** Set the lang attribute on the html element to the page's main language.

Before:

```html
<html>
```

After:

```html
<html lang="en-GB">
```

## Page has no title

WCAG 2.4.2 Page titled, level A. Impact: serious. Rule `page-title`.

**Why it matters:** The title is the first thing a screen reader says and the name of the browser tab.

**How to fix it:** Give every page a title that says what it is, then the site's name.

Before:

```html
<title></title>
```

After:

```html
<title>My books · Harbour Library</title>
```

## Zoom is blocked

WCAG 1.4.4 Resize text, level AA. Impact: critical. Rule `zoom`.

**Why it matters:** People with low vision zoom in on phones. Blocking it can make the site impossible to read.

**How to fix it:** Remove user-scalable=no and maximum-scale from the viewport tag.

Before:

```html
<meta name="viewport" content="width=device-width, user-scalable=no">
```

After:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Tab order changed by tabindex

WCAG 2.4.3 Focus order, level A. Impact: serious. Rule `tab-order`.

**Why it matters:** A tabindex above 0 makes keyboard focus jump around the page in an order that does not match what people see.

**How to fix it:** Use tabindex="0" or none, and put elements in the order they should be reached.

Before:

```html
<button tabindex="3">Save</button>
```

After:

```html
<button>Save</button>
```

## Focusable things hidden from screen readers

WCAG 4.1.2 Name, role, value, level A. Impact: serious. Rule `hidden-focus`.

**Why it matters:** Keyboard users can reach them, but screen readers say nothing, so it feels like focus has disappeared.

**How to fix it:** Do not put aria-hidden on anything that can take focus. Use the inert attribute, or hide it completely.

Before:

```html
<div aria-hidden="true"><a href="/help">Help</a></div>
```

After:

```html
<div inert><a href="/help">Help</a></div>
```

## Links that do not say where they go

WCAG 2.4.4 Link purpose (in context), level A. Impact: moderate. Rule `link-text`.

**Why it matters:** Screen reader users often list a page's links. "Click here" and "Read more" say nothing on their own.

**How to fix it:** Make the link's words name where it goes.

Before:

```html
To change your plan, <a href="/plan">click here</a> help.
```

After:

```html
<a href="/plan">Change your plan</a>.
```

## The same id used twice

WCAG 4.1.2 Name, role, value, level A. Impact: moderate. Rule `duplicate-id`.

**Why it matters:** Labels, descriptions and skip links point at ids. When an id is used twice, they can point at the wrong thing.

**How to fix it:** Make every id unique on the page.

Before:

```html
<input id="name"> … <input id="name">
```

After:

```html
<input id="first-name"> … <input id="last-name">
```

## What the automatic check cannot find

Automatic checks find only some problems. Before a release, also:

- use every page with a keyboard only: Tab, Shift and Tab, Enter, Space and Escape;
- zoom the browser to 200% and 400%, and check nothing is cut off or overlaps;
- listen to the page with a screen reader, such as NVDA on Windows, VoiceOver on a Mac or iPhone, or TalkBack on Android;
- check that error messages say how to fix the problem, and that nothing depends on colour alone.

## Find out more

- [Check a page for accessibility problems](check-a-page-for-accessibility-problems.md)
- [Turn on the accessibility check](activate-the-accessibility-check.md)
- [Find and fix accessibility problems](../guides/find-and-fix-accessibility-problems.md)
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) (opens in a new tab)
