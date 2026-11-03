# How this help is written

For anyone adding to or changing the help centre. Every article is a topic or a guide, follows the writing
rules below and is listed in the [help centre home](README.md). It follows the
[design system](https://github.com/TheMightyTRex/design-system)'s
[content design guide](https://github.com/TheMightyTRex/design-system/blob/main/docs/CONTENT-DESIGN.md).

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
[Help centre](../README.md) · <Area> · <How-to, Reference or Troubleshooting>

# <The task, in the reader's words, starting with a verb>

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

## Writing rules

1. British English, sentence case for every heading and title.
2. No em dashes and no contractions.
3. Select, not click or tap. Page, not screen. Switches are on and off.
4. No positions: name the control, never "top right".
5. On-screen labels are copied exactly from `snaglist.js` and shown in bold inside steps.
6. Sentences under 25 words, paragraphs of two to four sentences, active voice, "you".
7. Commands go in their own fenced block, one command per block, with what it does in the sentence before.
8. Links name their destination. A link that leaves the help says "(opens in a new tab)".
9. Made-up examples only: `owner/repo`, `team@example.com`, `reports.example.com`, Alex Example.
10. Pictures come from `tools/screenshots.sh`, which drives the demo with made-up data. Run it after any change
    to what Snaglist shows, and look at every picture. Describe each picture in words in its alt text.
11. `fix-common-accessibility-problems.md` is made from the rules in `snaglist.js` by `tools/fix-guide.py`.
    Change the rules, then run it; never edit that topic by hand.
