# How this help is written

For anyone adding to or changing the help centre. Every article is a topic or a guide, follows the writing
rules in this guide and is listed in the [help centre home](README.md). It follows the
[design system](https://github.com/TheMightyTRex/design-system)'s content design guide (`docs/CONTENT-DESIGN.md`)
and help writing guide (`docs/HELP-WRITING.md`); where they differ, they win.

## The two tiers

| Tier | Folder | What it is | Answers |
|---|---|---|---|
| 1 | `topics/` | A topic: one task, one question, one article | "How do I do this one thing?" |
| 2 | `guides/` | A guide: an ordered journey made of topics | "How do I get from nothing to this outcome?" |

- **A topic covers one task.** A second task is a second topic, and the two link to each other.
- **A guide is mostly links.** Each step is one or two sentences and a link to the topic that holds the
  instructions. A guide never repeats a topic's steps, so each instruction is kept in one place. If a step
  has no topic, write the topic first.

Readers may be new to code. Write so that someone who builds with an AI assistant, and has never edited HTML by
hand, can follow every step.

## Topic layout (Tier 1)

```
[Help centre](../README.md) · <Area>

# <The task, in the reader's words, starting with a verb>

<How-to, Reference or Troubleshooting>

One or two sentences: what this does and what you will have at the end. The answer comes first.

## Before you begin          (omit when there is nothing)
## Steps
## Things to note             (omit when there is nothing)
## If it does not work         (omit when there is nothing)
## Find out more
```

## Guide layout (Tier 2)

```
[Help centre](../README.md) · Guides

# <The outcome, in the reader's words>

Who this is for, what you will have at the end, and about how long it takes.

## Before you begin
## The steps at a glance       (a numbered list, then a Mermaid flowchart of the same steps)
## Step 1: <short name>        (one or two sentences, the link to the topic, and how you know it worked)
## What next
```

## Areas on the help home

Before you add Snaglist, Add and update, Sending feedback, Accessibility, Reports, Settings, When something is
wrong. Every topic sits in one area, named on its first line.

## Writing rules

1. British English, sentence case for every heading and title.
2. No em dashes and no contractions, headings included.
3. Select, not click or tap. Page, not screen. Settings are activated and deactivated, and are active or
   inactive; never enable, disable, turn on, turn off or toggle. Enter, not type.
4. No positions: name the control, never "top right".
5. On-screen labels are copied exactly from `snaglist.js`, in bold inside steps and in single quotation marks
   elsewhere: "the 'Send feedback' button". Double quotation marks are for words people say or enter.
5a. Never say how difficult something is (just, simply, easy, complex): give the step count or time instead.
5b. No promises about timing and no plans. Name a limitation as a fact.
5c. No "see" or "look", no "above" or "below": name the section or control.
6. Sentences under 25 words, paragraphs of two to four sentences, active voice, "you".
7. Commands go in their own fenced block, one command per block, with what it does in the sentence before.
8. Links name their destination. A link that leaves the help says "(opens in a new tab)".
9. Made-up examples only: Alex, Sam, Priya and Jordan; `owner/repo`; emails at `example.com`; domains ending
   `.example`; phone numbers `07700 900` then three digits.
10. Pictures come from `tools/screenshots.sh`, which drives the demo with made-up data. Run it after any change
    to what Snaglist shows, and check every picture. Describe each picture in words in its alt text.
11. `fix-common-accessibility-problems.md` is made from the rules in `snaglist.js` by `tools/fix-guide.py`.
    Change the rules, then run it; never edit that topic by hand.
