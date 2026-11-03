/*
 * Snaglist 0.1.0: report a UX issue on any page, tagged with the page and the part of it, without personal
 * information. One file, no libraries, MIT licence. https://github.com/TheMightyTRex/snaglist
 *
 * Add it:     <script src="snaglist.js" data-github="owner/repo" defer></script>
 *   or:       Snaglist.start({ app: "My app", send: { github: { repo: "owner/repo" } } })
 * Remove it:  Snaglist.destroy({ forget: true }), then delete the script tag. Nothing else is left behind.
 *
 * Everything lives in one element, <snag-list>, with its own shadow root, so its styles never touch the page
 * and the page's styles never break it. Help is in docs/README.md; settings in docs/topics/settings-reference.md.
 */
(() => {
  "use strict";
  if (window.Snaglist) return;

  const VERSION = "0.1.0";
  const KEY = "snaglist:";

  // Preset lists. A category is [value, label, hint]; a severity is [value, label, hint].
  const CATEGORIES = {
    ux: [
      ["layout", "Layout", "Overlaps, alignment, spacing, things cut off"],
      ["words", "Words", "Unclear, wrong or inconsistent text"],
      ["behaviour", "Behaviour", "Does not do what you expected"],
      ["accessibility", "Accessibility", "Keyboard, screen reader, contrast, zoom"],
      ["looks", "Looks", "Colour, icons, type, not like the rest"],
      ["broken", "Broken", "An error, or something does not work"],
      ["slow", "Slow", "Takes too long or freezes"],
      ["idea", "Idea", "A suggestion, not a fault"],
    ],
    heuristics: [
      ["status", "Status not clear", "Nielsen 1: visibility of system status"],
      ["language", "Not the user's language", "Nielsen 2: match with the real world"],
      ["control", "No way out", "Nielsen 3: user control and freedom"],
      ["consistency", "Inconsistent", "Nielsen 4: consistency and standards"],
      ["errors", "Easy to make a mistake", "Nielsen 5: error prevention"],
      ["recall", "Too much to remember", "Nielsen 6: recognition rather than recall"],
      ["efficiency", "Slow to use", "Nielsen 7: flexibility and efficiency"],
      ["clutter", "Cluttered", "Nielsen 8: aesthetic and minimalist design"],
      ["recovery", "Unhelpful error", "Nielsen 9: help users recover from errors"],
      ["help", "Help missing", "Nielsen 10: help and documentation"],
    ],
    wcag: [
      ["perceivable", "Hard to see or hear", "WCAG: perceivable (contrast, text size, alternatives)"],
      ["operable", "Hard to use", "WCAG: operable (keyboard, focus, targets, time)"],
      ["understandable", "Hard to understand", "WCAG: understandable (words, labels, errors)"],
      ["robust", "Does not work with my tools", "WCAG: robust (screen readers, zoom, other browsers)"],
    ],
  };
  const SEVERITIES = {
    three: [
      ["minor", "Minor", "Cosmetic, easy to live with"],
      ["in-the-way", "Gets in the way", "Slows me down or confuses me"],
      ["stops-me", "Stops me", "I cannot finish what I came to do"],
    ],
    nielsen: [
      ["1", "1 Cosmetic", "Fix if there is time"],
      ["2", "2 Minor", "Low priority"],
      ["3", "3 Major", "High priority"],
      ["4", "4 Catastrophe", "Fix before release"],
    ],
  };

  const DEFAULTS = {
    app: "",
    version: "",
    enabled: true,          // the developer's switch
    userToggle: true,       // respect the user's own switch (Snaglist.setUserEnabled)
    launcher: "bottom-right", // "bottom-right", "bottom-left" or false (call Snaglist.open() yourself)
    shortcut: "",           // for example "Alt+Shift+R"; empty for none
    categories: "ux",       // a preset name or your own list of [value, label, hint]
    severities: "three",    // "three", "nielsen" or your own list
    labels: ["ux-report"],  // GitHub labels added to every report (when the sender may add labels)
    collect: {
      page: true,           // page name and path pattern (numbers and ids become :id; no query or hash)
      element: true,        // the chosen part: component, role, accessible name, selector, size
      styles: false,        // the chosen part's font size, colours and their contrast ratio
      environment: true,    // viewport, zoom, browser and system family, language
      display: true,        // theme, text size, reduced motion and contrast preferences
      errors: false,        // the last five script errors on this page (redacted)
      trail: false,         // the last five things selected on this page (component and name only)
    },
    page: {
      name: null,           // function returning the page's name; default: the document title
      keepParams: [],       // query parameters safe to keep, for example ["tab", "view"]
    },
    component: {
      attribute: "data-component", // the nearest element with this attribute names the component
      from: null,           // function (element) => string, to name components your own way
    },
    redact: [],             // extra patterns: [[/regex/g, "[label]"]]
    send: {
      github: null,         // { repo: "owner/repo", labels: [] }: opens a filled-in GitHub issue
      email: null,          // { to: "team@example.com", subject: "UX report" }: opens the mail app
      endpoint: null,       // { url: "https://example.com/reports", headers: {} }: posts JSON (no cookies)
      copy: true,           // Copy as Markdown
      download: true,       // Download as JSON
    },
    beforeSend: null,       // function (report) => report, to add or remove anything before it is shown
    text: {},               // replace any interface text, see TEXT below
  };

  const TEXT = {
    launcher: "Report an issue",
    pickPrompt: "Choose the part with the issue: select it, or Tab to it and press Enter. Escape stops.",
    wholePage: "Whole page",
    stop: "Stop",
    formTitle: "Report an issue",
    where: "Where",
    what: "What is wrong",
    whatHint: "What did you expect, and what happened?",
    whatError: "Say what is wrong",
    category: "Kind of issue",
    severity: "How bad is it",
    review: "Review what is sent",
    cancel: "Cancel",
    reviewTitle: "What is sent",
    privacy: "No personal information is kept in this report: no name, email, account, address, cookies or anything typed into the page's fields. Things that look like an email, a long number or a key are replaced. Untick anything you would rather not send.",
    githubNote: "GitHub opens with the report filled in. You post it from your own GitHub account, so GitHub shows your user name on the issue.",
    emailNote: "Your mail app opens with the report filled in. The reply address is your own.",
    endpointNote: "The report is sent to the site's own server, without cookies.",
    sendGithub: "Open in GitHub",
    sendEmail: "Open in email",
    sendEndpoint: "Send",
    copy: "Copy as Markdown",
    download: "Download",
    back: "Back",
    close: "Close",
    copied: "Report copied",
    copiedForGithub: "The report was too long for GitHub's address, so it is on your clipboard: paste it into the issue.",
    sent: "Report sent. Thank you.",
    sendFailed: "Not sent",
    opened: "Opened. Thank you.",
  };

  let config = null;
  let host = null;      // <snag-list>
  let root = null;      // its shadow root
  let launcher = null;
  let picking = null;
  let lastFocus = null;
  const errors = [];
  const trail = [];
  const pageListeners = {};

  // Small helpers -----------------------------------------------------------------------------------------

  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    node.append(...children.flat().filter((c) => c != null && c !== false));
    return node;
  }

  const ICONS = {
    flag: ["M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"],
    x: ["M18 6 6 18", "m6 6 12 12"],
  };
  function icon(name) {
    const ns = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(ns, "svg");
    for (const [k, v] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2,
      "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })) s.setAttribute(k, v);
    for (const d of ICONS[name]) { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); s.append(p); }
    return s;
  }

  const t = (key) => (config && config.text[key]) || TEXT[key];
  const store = {
    get(name) { try { return localStorage.getItem(KEY + name); } catch { return null; } },
    set(name, value) { try { value == null ? localStorage.removeItem(KEY + name) : localStorage.setItem(KEY + name, value); } catch { /* private window */ } },
  };
  const merge = (base, extra) => {
    const out = { ...base };
    for (const [k, v] of Object.entries(extra || {})) {
      out[k] = v && typeof v === "object" && !Array.isArray(v) && typeof v !== "function" && base[k] && typeof base[k] === "object"
        ? merge(base[k], v) : v;
    }
    return out;
  };
  const ours = (event) => event.composedPath().includes(host);
  const list = (value, presets) => (Array.isArray(value) ? value : presets[value] || presets[Object.keys(presets)[0]]);

  // Anonymity --------------------------------------------------------------------------------------------

  const PATTERNS = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]"],
    [/\b(?:ghp|gho|github_pat|sk|pk|xox[bap])[-_][A-Za-z0-9_-]{8,}/g, "[key]"],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[key]"],
    [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[address]"],
    [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]"],
    [/\b[A-Za-z0-9_-]*\d[A-Za-z0-9_-]*[A-Za-z][A-Za-z0-9_-]{22,}\b/g, "[key]"],
    [/\+?\d[\d ()-]{5,}\d/g, "[number]"],
  ];
  function redact(text) {
    let out = String(text ?? "");
    for (const [pattern, label] of [...PATTERNS, ...config.redact]) out = out.replace(pattern, label);
    return out;
  }
  const clip = (text, n) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

  function pathPattern() {
    const segments = location.pathname.split("/").map((s) => {
      const raw = decodeURIComponent(s);
      return /^\d+$/.test(raw) || /^[0-9a-f-]{8,}$/i.test(raw) || /@/.test(raw) || (/\d/.test(raw) && raw.length >= 16) ? ":id" : raw;
    });
    const params = new URLSearchParams(location.search);
    const kept = config.page.keepParams.filter((k) => params.has(k)).map((k) => `${k}=${redact(params.get(k))}`);
    return segments.join("/") + (kept.length ? `?${kept.join("&")}` : "");
  }

  function browserAndSystem() {
    const ua = navigator.userAgent;
    const browser = [[/Edg\/(\d+)/, "Edge"], [/OPR\/(\d+)/, "Opera"], [/Firefox\/(\d+)/, "Firefox"], [/Chrome\/(\d+)/, "Chrome"],
      [/Version\/(\d+).*Safari/, "Safari"]].map(([re, name]) => { const m = ua.match(re); return m && `${name} ${m[1]}`; }).find(Boolean) || "Other";
    const system = [[/Android/, "Android"], [/iPhone|iPad|iPod/, "iOS"], [/Mac OS X|Macintosh/, "macOS"], [/Windows/, "Windows"],
      [/CrOS/, "ChromeOS"], [/Linux/, "Linux"]].find(([re]) => re.test(ua))?.[1] || "Other";
    return { browser, system };
  }

  // Naming the chosen part -------------------------------------------------------------------------------

  const ROLES = { a: "link", button: "button", input: "field", select: "choice", textarea: "text box", img: "picture", svg: "icon",
    nav: "menu", header: "header", footer: "footer", main: "main content", aside: "side panel", dialog: "dialog", form: "form",
    table: "table", tr: "table row", td: "table cell", th: "table heading", ul: "list", ol: "list", li: "list item",
    label: "label", p: "text", section: "section", article: "card" };
  const NAMED = new Set(["a", "button", "label", "h1", "h2", "h3", "h4", "h5", "h6", "th", "legend", "summary", "option"]);

  function roleOf(el) {
    const tag = el.tagName.toLowerCase();
    return el.getAttribute("role") || ROLES[tag] || (/^h[1-6]$/.test(tag) ? `heading ${tag[1]}` : "area");
  }

  // The accessible name, but only for things whose name is a label (buttons, links, headings, fields), never
  // the text of a whole area, which could hold someone's name or messages. Fields give their label, never their value.
  function nameOf(el) {
    if (el.closest("[data-snag-private]")) return "[private]";
    const tag = el.tagName.toLowerCase();
    let name = el.getAttribute("aria-label") || "";
    const labelledby = el.getAttribute("aria-labelledby");
    if (!name && labelledby) name = labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ");
    if (!name && ["input", "select", "textarea"].includes(tag)) name = (el.labels && el.labels[0]?.textContent) || el.getAttribute("placeholder") || "";
    if (!name && tag === "img") name = el.getAttribute("alt") || "";
    if (!name && (NAMED.has(tag) || /^(button|link|tab|menuitem|heading|checkbox|radio|switch|option)$/.test(el.getAttribute("role") || "")))
      name = el.textContent || "";
    if (!name) name = el.getAttribute("title") || "";
    return clip(redact(name.replace(/\s+/g, " ").trim()), 80);
  }

  function componentOf(el) {
    if (typeof config.component.from === "function") {
      try { const named = config.component.from(el); if (named) return String(named); } catch { /* fall through */ }
    }
    const attr = config.component.attribute;
    const marked = attr && el.closest(`[${attr}]`);
    if (marked) return marked.getAttribute(attr);
    for (let n = el, i = 0; n && n !== document.body && i < 5; n = n.parentElement, i++) {
      const block = [...n.classList].find((c) => !/__|--|^(is|has|js)-/.test(c) && c.length > 1 && !/\d{3,}/.test(c));
      if (block) return block;
    }
    return "";
  }

  function selectorOf(el) {
    const steps = [];
    for (let n = el; n && n !== document.documentElement && steps.length < 5; n = n.parentElement) {
      if (n.id && !/\d{3,}/.test(n.id)) { steps.unshift(`#${CSS.escape(n.id)}`); break; }
      let step = n.tagName.toLowerCase();
      const classes = [...n.classList].filter((c) => !/^(is|has)-/.test(c) && !/\d{3,}/.test(c)).slice(0, 2);
      if (classes.length) step += classes.map((c) => `.${CSS.escape(c)}`).join("");
      const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
      if (same.length > 1) step += `:nth-of-type(${same.indexOf(n) + 1})`;
      steps.unshift(step);
    }
    return steps.join(" > ");
  }

  function parseColour(value) {
    const m = value.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?/);
    if (!m) return null;
    const a = m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  const hex = (c) => `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  function luminance(c) {
    const [r, g, b] = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function stylesOf(el) {
    const s = getComputedStyle(el);
    const fg = parseColour(s.color);
    let bg = null;
    for (let n = el; n; n = n.parentElement) {
      const c = parseColour(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.95) { bg = c; break; }
    }
    bg = bg || { r: 255, g: 255, b: 255, a: 1 };
    const out = { fontSize: s.fontSize, fontWeight: s.fontWeight, text: fg ? hex(fg) : s.color, background: hex(bg) };
    if (fg) {
      const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      out.contrast = `${((l1 + 0.05) / (l2 + 0.05)).toFixed(2)}:1`;
    }
    return out;
  }

  function describe(el) {
    if (!el || el === document.body || el === document.documentElement) return { whole: true, label: t("wholePage") };
    const r = el.getBoundingClientRect();
    const out = { component: componentOf(el), role: roleOf(el), name: nameOf(el), selector: selectorOf(el),
      size: `${Math.round(r.width)}×${Math.round(r.height)}` };
    out.label = [out.component, out.role, out.name && `"${out.name}"`].filter(Boolean).join(", ");
    if (config.collect.styles) out.styles = stylesOf(el);
    return out;
  }

  // The report -------------------------------------------------------------------------------------------

  function buildReport(part, form) {
    const c = config.collect;
    const report = { tool: `snaglist ${VERSION}`, app: config.app || location.host, version: config.version || undefined,
      category: form.category, severity: form.severity, what: clip(redact(form.what), 3000) };
    if (c.page) {
      let name = document.title;
      if (typeof config.page.name === "function") { try { name = config.page.name() || name; } catch { /* keep the title */ } }
      report.page = { name: clip(redact(name), 120), path: pathPattern() };
    }
    if (c.element) report.element = part.whole ? { whole: true } : { ...part, label: undefined };
    if (c.environment) {
      const { browser, system } = browserAndSystem();
      report.environment = { viewport: `${innerWidth}×${innerHeight}`, zoom: Math.round(devicePixelRatio * 100) / 100,
        browser, system, language: navigator.language, touch: matchMedia("(pointer: coarse)").matches };
    }
    if (c.display) {
      const rootEl = document.documentElement;
      const scheme = rootEl.dataset.theme || rootEl.getAttribute("data-color-scheme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark (device)" : "light (device)");
      report.display = { theme: scheme, textSize: getComputedStyle(rootEl).fontSize,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        moreContrast: matchMedia("(prefers-contrast: more)").matches, forcedColours: matchMedia("(forced-colors: active)").matches };
    }
    if (c.errors && errors.length) report.errors = errors.slice(-5);
    if (c.trail && trail.length) report.trail = trail.slice(-5);
    report.created = new Date().toISOString().slice(0, 16) + "Z";
    if (typeof config.beforeSend === "function") {
      try { return config.beforeSend(structuredClone(report)) || report; } catch { return report; }
    }
    return report;
  }

  const label = (items, value) => (items.find(([v]) => v === value) || [value, value])[1];

  function titleOf(report) {
    const first = report.what.split("\n")[0];
    const where = report.element && !report.element.whole && report.element.component ? `${report.element.component}: ` : "";
    return clip(`${where}${first}`, 90);
  }

  function markdown(report, short) {
    const cats = list(config.categories, CATEGORIES);
    const sevs = list(config.severities, SEVERITIES);
    const row = (k, v) => (v === undefined || v === "" || v === false ? null : `| ${k} | ${String(v).replace(/\|/g, "\\|").replace(/\n/g, " ")} |`);
    const lines = [report.what, "", "| | |", "|---|---|",
      row("Kind", label(cats, report.category)), row("How bad", label(sevs, report.severity)),
      row("App", [report.app, report.version].filter(Boolean).join(" "))];
    if (report.page) lines.push(row("Page", report.page.name), row("Path", `\`${report.page.path}\``));
    const e = report.element;
    if (e) {
      if (e.whole) lines.push(row("Part", "Whole page"));
      else lines.push(row("Component", e.component && `\`${e.component}\``), row("Part", [e.role, e.name && `"${e.name}"`].filter(Boolean).join(", ")),
        row("Selector", e.selector && `\`${e.selector}\``), row("Size", e.size));
      if (e.styles) lines.push(row("Styles", `${e.styles.fontSize}, weight ${e.styles.fontWeight}, ${e.styles.text} on ${e.styles.background}, contrast ${e.styles.contrast}`));
    }
    const env = report.environment;
    if (env) lines.push(row("Screen", `${env.viewport}, zoom ${env.zoom}${env.touch ? ", touch" : ""}`), row("Browser", `${env.browser} on ${env.system}, ${env.language}`));
    const d = report.display;
    if (d) lines.push(row("Display", [d.theme, `text ${d.textSize}`, d.reducedMotion && "reduced motion", d.moreContrast && "more contrast", d.forcedColours && "forced colours"].filter(Boolean).join(", ")));
    lines.push(row("Reported", report.created.replace("T", " ")));
    const out = lines.filter((line) => line != null);
    if (!short && report.trail) out.push("", "**Selected before this:**", ...report.trail.map((s) => `- ${s}`));
    if (!short && report.errors) out.push("", "**Script errors on this page:**", "```", ...report.errors, "```");
    out.push("", `<sub>Sent with ${report.tool}. No personal information is kept in this report.</sub>`);
    return out.join("\n");
  }

  const plain = (md) => md.replace(/^\|---\|---\|$/m, "").replace(/^\| \| \|$/m, "").replace(/^\| (.+?) \| (.*) \|$/gm, "$1: $2")
    .replace(/[`*]|<\/?sub>/g, "").replace(/\n{3,}/g, "\n\n");

  // Sending ----------------------------------------------------------------------------------------------

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const area = h("textarea", { style: "position:fixed;opacity:0" }); area.value = text; root.append(area); area.select();
      const ok = document.execCommand("copy"); area.remove(); return ok;
    }
  }

  // A new tab for GitHub, cut off from this page; the same tab when pop-ups are blocked. Mail links open the
  // mail app without leaving the page.
  function openUrl(url) {
    if (url.startsWith("mailto:")) { location.href = url; return; }
    const w = window.open(url, "_blank");
    if (w) w.opener = null;
    else location.href = url;
  }

  async function sendGithub(report) {
    const g = config.send.github;
    const labels = [...config.labels, ...(g.labels || []), `kind: ${report.category}`, `severity: ${report.severity}`].join(",");
    const base = `https://github.com/${g.repo}/issues/new?labels=${encodeURIComponent(labels)}&title=${encodeURIComponent(titleOf(report))}`;
    let url = `${base}&body=${encodeURIComponent(markdown(report))}`;
    if (url.length > 7500) url = `${base}&body=${encodeURIComponent(markdown(report, true))}`;
    if (url.length > 7500) {
      await copyText(markdown(report));
      url = `${base}&body=${encodeURIComponent("(Paste the report here: it is on your clipboard.)")}`;
      say(t("copiedForGithub"));
    }
    openUrl(url);
    return t("opened");
  }

  async function sendEmail(report) {
    const m = config.send.email;
    let body = plain(markdown(report));
    if (body.length > 1800) { await copyText(body); body = `${clip(body, 1600)}\n\n(The full report is on your clipboard.)`; }
    openUrl(`mailto:${encodeURIComponent(m.to)}?subject=${encodeURIComponent(`${m.subject || "UX report"}: ${titleOf(report)}`)}&body=${encodeURIComponent(body)}`);
    return t("opened");
  }

  async function sendEndpoint(report) {
    const ep = config.send.endpoint;
    const res = await fetch(ep.url, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json", ...(ep.headers || {}) },
      body: JSON.stringify({ title: titleOf(report), markdown: markdown(report), report }) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return t("sent");
  }

  function download(report) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const a = h("a", { href: url, download: `ux-report-${report.created.slice(0, 10)}.json` });
    root.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Interface --------------------------------------------------------------------------------------------

  function say(message) {
    const region = root.querySelector(".sl-status");
    region.textContent = "";
    requestAnimationFrame(() => { region.textContent = message; });
    region.hidden = false;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { region.hidden = true; }, 6000);
  }

  function dialog(title, body, foot) {
    const id = `sl-${Math.random().toString(36).slice(2)}`;
    const d = h("dialog", { class: "sl-dialog", "aria-labelledby": id },
      h("div", { class: "sl-head" }, h("h2", { id, text: title }),
        h("button", { type: "button", class: "sl-icon", "aria-label": `${t("close")}: ${title}`, onclick: () => d.close() }, icon("x"))),
      h("div", { class: "sl-body" }, body),
      h("div", { class: "sl-foot" }, foot));
    d.addEventListener("close", () => { d.remove(); if (!root.querySelector("dialog[open]")) restoreFocus(); });
    root.append(d);
    d.showModal();
    return d;
  }

  function restoreFocus() {
    const target = lastFocus && lastFocus.isConnected ? lastFocus : launcher;
    target?.focus?.();
  }

  function startPicking() {
    if (picking || !config) return;
    lastFocus = document.activeElement;
    if (launcher) launcher.hidden = true;
    const outline = h("div", { class: "sl-outline", hidden: true });
    const whole = h("button", { type: "button", class: "sl-btn", text: t("wholePage"), onclick: () => finishPicking(document.body) });
    const stopBtn = h("button", { type: "button", class: "sl-btn", text: t("stop"), onclick: () => endPicking(true) });
    const banner = h("div", { class: "sl-banner", role: "region", "aria-label": t("formTitle") },
      h("p", { text: t("pickPrompt") }), h("div", { class: "sl-actions" }, whole, stopBtn));
    root.append(outline, banner);
    let current = null;
    const show = (target) => {
      if (!(target instanceof Element) || target === host) { outline.hidden = true; current = null; return; }
      current = target;
      const r = target.getBoundingClientRect();
      Object.assign(outline.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
      outline.hidden = false;
    };
    const block = (e) => { if (!ours(e)) { e.preventDefault(); e.stopImmediatePropagation(); } };
    const listeners = {
      pointermove: (e) => { if (!ours(e)) show(e.target); },
      pointerdown: block, mousedown: block, pointerup: block, mouseup: block, touchstart: block,
      click: (e) => { if (ours(e)) return; block(e); finishPicking(e.target); },
      focusin: (e) => { if (!ours(e)) show(e.target); },
      keydown: (e) => {
        if (e.key === "Escape") { e.preventDefault(); endPicking(true); return; }
        if ((e.key === "Enter" || e.key === " ") && !ours(e) && document.activeElement && document.activeElement !== document.body) {
          block(e); finishPicking(document.activeElement);
        }
      },
      scroll: () => current && show(current),
    };
    for (const [type, fn] of Object.entries(listeners)) window.addEventListener(type, fn, { capture: true, passive: false });
    picking = { outline, banner, listeners };
    whole.focus();
  }

  function endPicking(refocus) {
    if (!picking) return;
    for (const [type, fn] of Object.entries(picking.listeners)) window.removeEventListener(type, fn, { capture: true });
    picking.outline.remove();
    picking.banner.remove();
    picking = null;
    if (launcher) launcher.hidden = false;
    if (refocus) restoreFocus();
  }

  function finishPicking(target) {
    endPicking(false);
    openForm(describe(target));
  }

  function choiceGroup(name, items, checked, legend) {
    return h("fieldset", { class: "sl-choices" }, h("legend", { text: legend }),
      items.map(([value, text, hint], i) => h("label", { class: "sl-choice" },
        h("input", { type: "radio", name, value, checked: value === checked || (!checked && i === 0) }),
        h("span", {}, h("span", { class: "sl-choice__name", text }), hint ? h("span", { class: "sl-muted", text: hint }) : null))));
  }

  function openForm(part, previous = {}) {
    const cats = list(config.categories, CATEGORIES);
    const sevs = list(config.severities, SEVERITIES);
    const what = h("textarea", { id: "sl-what", name: "what", rows: 4, required: true, "aria-describedby": "sl-what-hint" });
    what.value = previous.what || "";
    const error = h("p", { class: "sl-error", id: "sl-what-error", hidden: true, text: t("whatError") });
    const category = h("select", { id: "sl-category", name: "category" },
      cats.map(([value, text, hint]) => h("option", { value, text: hint ? `${text}: ${hint}` : text, selected: value === previous.category })));
    const form = h("form", { id: "sl-form", class: "sl-form", novalidate: true },
      h("div", { class: "sl-field" }, h("span", { class: "sl-label", text: t("where") }), h("p", { class: "sl-where", text: part.label }),
        h("button", { type: "button", class: "sl-link", text: "Choose again", onclick: () => { d.close(); startPicking(); } })),
      h("div", { class: "sl-field" }, h("label", { class: "sl-label", for: "sl-what", text: t("what") }),
        h("p", { class: "sl-muted", id: "sl-what-hint", text: t("whatHint") }), error, what),
      h("div", { class: "sl-field" }, h("label", { class: "sl-label", for: "sl-category", text: t("category") }), category),
      choiceGroup("severity", sevs, previous.severity || sevs[Math.min(1, sevs.length - 1)][0], t("severity")));
    const next = h("button", { type: "submit", form: "sl-form", class: "sl-btn sl-btn--primary", text: t("review") });
    const d = dialog(t("formTitle"), form, [next, h("button", { type: "button", class: "sl-btn", text: t("cancel"), onclick: () => d.close() })]);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = what.value.trim();
      error.hidden = !!text;
      if (!text) { what.setAttribute("aria-invalid", "true"); what.setAttribute("aria-describedby", "sl-what-error sl-what-hint"); what.focus(); return; }
      const values = { what: text, category: category.value, severity: form.severity.value };
      d.close();
      openReview(part, values);
    });
    what.focus();
  }

  const OPTIONAL = [["element", "The part of the page"], ["styles", "Its font and colours"], ["environment", "Screen and browser"],
    ["display", "Display settings"], ["errors", "Script errors"], ["trail", "What was selected before"]];

  function openReview(part, values) {
    let report = buildReport(part, values);
    const preview = h("pre", { class: "sl-preview", tabindex: "0", "aria-label": t("reviewTitle") });
    const draw = () => { preview.textContent = markdown(report); };
    const removed = new Set();
    const toggles = OPTIONAL.filter(([key]) => key === "styles" ? report.element?.styles : report[key]).map(([key, text]) =>
      h("label", { class: "sl-check" }, h("input", { type: "checkbox", checked: true, onchange: (e) => {
        e.target.checked ? removed.delete(key) : removed.add(key);
        report = buildReport(part, values);
        for (const k of removed) { if (k === "styles") { if (report.element) delete report.element.styles; } else delete report[k]; }
        draw();
      } }), h("span", { text })));
    draw();
    const s = config.send;
    const notes = [s.github && t("githubNote"), s.email && t("emailNote"), s.endpoint && t("endpointNote")].filter(Boolean);
    const body = [
      h("p", { class: "sl-privacy", text: t("privacy") }),
      toggles.length ? h("fieldset", { class: "sl-checks" }, h("legend", { text: "Include" }), toggles) : null,
      preview,
      ...notes.map((n) => h("p", { class: "sl-muted", text: n })),
    ];
    const run = async (button, fn) => {
      button.disabled = true;
      try { const message = await fn(report); if (message) say(message); d.close(); }
      catch (err) { say(`${t("sendFailed")}: ${err.message || err}`); button.disabled = false; }
    };
    // The first way of sending is the primary button; the rest are secondary.
    const buttons = [];
    const add = (text, fn) => {
      const b = h("button", { type: "button", class: buttons.length ? "sl-btn" : "sl-btn sl-btn--primary", text });
      b.addEventListener("click", () => run(b, fn));
      buttons.push(b);
    };
    if (s.github?.repo) add(t("sendGithub"), sendGithub);
    if (s.email?.to) add(t("sendEmail"), sendEmail);
    if (s.endpoint?.url) add(t("sendEndpoint"), sendEndpoint);
    if (s.copy) add(t("copy"), async (r) => ((await copyText(markdown(r))) ? t("copied") : null));
    if (s.download) add(t("download"), async (r) => { download(r); return null; });
    buttons.push(h("button", { type: "button", class: "sl-btn", text: t("back"), onclick: () => { d.close(); openForm(part, values); } }));
    const d = dialog(t("reviewTitle"), body, buttons);
    buttons[0].focus();
  }

  // Watching for errors and the trail, only when asked ------------------------------------------------------

  function watch() {
    if (config.collect.errors) {
      pageListeners.error = (e) => { errors.push(clip(redact(`${e.message || e.error || "Error"}${e.filename ? ` (${e.filename.split("/").pop().split("?")[0]}:${e.lineno})` : ""}`), 200)); if (errors.length > 20) errors.shift(); };
      pageListeners.unhandledrejection = (e) => { errors.push(clip(redact(`Unhandled: ${e.reason?.message || e.reason}`), 200)); if (errors.length > 20) errors.shift(); };
    }
    if (config.collect.trail) {
      pageListeners.click = (e) => {
        if (picking || ours(e) || !(e.target instanceof Element)) return;
        const el = e.target.closest("a, button, [role], input, select, summary, label") || e.target;
        const d = describe(el);
        trail.push([d.component, d.role, d.name && `"${d.name}"`].filter(Boolean).join(", "));
        if (trail.length > 20) trail.shift();
      };
    }
    if (config.shortcut) {
      const parts = config.shortcut.toLowerCase().split("+");
      pageListeners.keydown = (e) => {
        if (e.key.toLowerCase() === parts[parts.length - 1] && e.altKey === parts.includes("alt") && e.shiftKey === parts.includes("shift") &&
          e.ctrlKey === parts.includes("ctrl") && e.metaKey === parts.includes("meta")) { e.preventDefault(); startPicking(); }
      };
    }
    for (const [type, fn] of Object.entries(pageListeners)) window.addEventListener(type, fn, true);
  }

  // Styles, inside the shadow root only. Colours come from the page's design tokens when it has them. ----------

  const CSS_TEXT = `
:host { all: initial; }
* { box-sizing: border-box; }
.sl { --a: var(--color-accent, #0b5f5a); --at: var(--color-accent-text, #fff); --bg: var(--color-surface-raised, #fff);
  --tx: var(--color-text, #141416); --mu: var(--color-text-muted, #424b5b); --bd: var(--color-border, #7d879a);
  --sk: var(--color-surface-sunken, #eef1f6); --fo: var(--color-focus, var(--a)); --er: var(--status-danger-fg, #a1262a);
  font: 1rem/1.5 var(--font, system-ui, -apple-system, "Segoe UI", sans-serif); color: var(--tx); }
@media (prefers-color-scheme: dark) { .sl:not(.sl--light) { --a: var(--color-accent, #5ed3c6); --at: var(--color-accent-text, #101827);
  --bg: var(--color-surface-raised, #232f42); --tx: var(--color-text, #f3f4f6); --mu: var(--color-text-muted, #a4aec1);
  --bd: var(--color-border, #6f7b91); --sk: var(--color-surface-sunken, #0c1220); --er: var(--status-danger-fg, #ff9b9b); } }
button, input, select, textarea { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--fo); outline-offset: 2px; }
[hidden] { display: none !important; }
.sl-btn { min-height: 44px; padding: 0 16px; border: 1px solid var(--bd); background: var(--bg); color: var(--tx); cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; border-radius: 0; font-weight: 600; }
.sl-btn--primary { background: var(--a); color: var(--at); border-color: var(--a); }
.sl-btn:disabled { opacity: .6; cursor: progress; }
.sl-btn svg, .sl-icon svg { width: 18px; height: 18px; }
.sl-launcher { position: fixed; bottom: 16px; z-index: 2147483000; box-shadow: 0 2px 8px rgb(0 0 0 / .25); }
.sl-launcher--bottom-right { right: 16px; } .sl-launcher--bottom-left { left: 16px; }
.sl-icon { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: none; cursor: pointer; color: var(--tx); }
.sl-link { min-height: 44px; border: 0; background: none; color: var(--a); text-decoration: underline; cursor: pointer; padding: 0; justify-self: start; }
.sl-banner { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483001; width: min(640px, calc(100vw - 32px));
  background: var(--bg); border: 2px solid var(--a); padding: 12px 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  justify-content: space-between; box-shadow: 0 4px 16px rgb(0 0 0 / .25); }
.sl-banner p { margin: 0; flex: 1 1 260px; }
.sl-actions, .sl-foot { display: flex; flex-wrap: wrap; gap: 8px; }
.sl-outline { position: fixed; z-index: 2147482999; pointer-events: none; outline: 3px solid var(--a); outline-offset: 2px;
  background: color-mix(in srgb, var(--a) 12%, transparent); transition: all 80ms ease-out; }
@media (prefers-reduced-motion: reduce) { .sl-outline { transition: none; } }
.sl-dialog { width: min(640px, calc(100vw - 32px)); max-height: calc(100vh - 32px); padding: 0; border: 1px solid var(--bd);
  background: var(--bg); color: var(--tx); border-radius: 0; display: flex; flex-direction: column; }
.sl-dialog:not([open]) { display: none; }
.sl-dialog::backdrop { background: rgb(0 0 0 / .45); }
.sl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 4px 4px 20px; border-bottom: 1px solid var(--bd); }
.sl-head h2 { font-size: 1.125rem; margin: 0; }
.sl-body { padding: 16px 20px; overflow: auto; display: grid; gap: 16px; }
.sl-foot { padding: 12px 20px; border-top: 1px solid var(--bd); }
.sl-form { display: grid; gap: 16px; }
.sl-field { display: grid; gap: 4px; }
.sl-label, legend { font-weight: 600; padding: 0; }
.sl-where { margin: 0; padding: 8px 12px; background: var(--sk); overflow-wrap: anywhere; }
.sl-muted { color: var(--mu); margin: 0; font-size: .875rem; }
.sl-error { color: var(--er); font-weight: 600; margin: 0; }
textarea, select { width: 100%; min-height: 44px; padding: 8px 12px; border: 1px solid var(--bd); background: var(--bg); border-radius: 0; }
textarea[aria-invalid="true"] { border: 2px solid var(--er); }
fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 4px; }
.sl-choice, .sl-check { display: flex; gap: 12px; align-items: flex-start; min-height: 44px; padding: 8px 0; cursor: pointer; }
.sl-choice input, .sl-check input { width: 22px; height: 22px; margin: 1px 0 0; accent-color: var(--a); flex: none; }
.sl-choice > span { display: grid; }
.sl-choice__name { font-weight: 600; }
.sl-checks { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); column-gap: 16px; }
.sl-checks legend { grid-column: 1 / -1; }
.sl-check { min-height: 44px; padding: 4px 0; }
.sl-privacy { margin: 0; padding: 12px 16px; border-left: 4px solid var(--a); background: var(--sk); }
.sl-preview { margin: 0; padding: 12px; background: var(--sk); border: 1px solid var(--bd); white-space: pre-wrap; overflow-wrap: anywhere;
  font: .8125rem/1.5 ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; min-height: 12rem; max-height: 40vh; overflow: auto; }
.sl-status { position: fixed; bottom: 72px; right: 16px; z-index: 2147483002; max-width: min(420px, calc(100vw - 32px)); padding: 12px 16px;
  background: var(--tx); color: var(--bg); box-shadow: 0 2px 8px rgb(0 0 0 / .3); }
@media (forced-colors: active) { .sl-outline { outline-color: Highlight; background: none; } .sl-btn--primary { border: 2px solid ButtonText; } }
`;

  // Start, stop and the switches ----------------------------------------------------------------------------

  function userEnabled() { return store.get("off") !== "1"; }

  function start(options = {}) {
    if (host) destroy();
    config = merge(DEFAULTS, options);
    if (!config.enabled || (config.userToggle && !userEnabled())) { config = null; return false; }
    host = document.createElement("snag-list");
    host.setAttribute("data-snag-private", "");
    root = host.attachShadow({ mode: "open" });
    const style = h("style", { text: CSS_TEXT });
    const wrap = h("div", { class: "sl" }, h("div", { class: "sl-status", role: "status", hidden: true }));
    root.append(style, wrap);
    root.append = (...nodes) => wrap.append(...nodes); // everything goes inside the themed wrapper
    if (config.launcher) {
      launcher = h("button", { type: "button", class: `sl-btn sl-btn--primary sl-launcher sl-launcher--${config.launcher}`, onclick: startPicking },
        icon("flag"), t("launcher"));
      root.append(launcher);
    }
    (document.body || document.documentElement).append(host);
    watch();
    return true;
  }

  function destroy({ forget = false } = {}) {
    endPicking(false);
    for (const [type, fn] of Object.entries(pageListeners)) { window.removeEventListener(type, fn, true); delete pageListeners[type]; }
    host?.remove();
    host = root = launcher = config = null;
    errors.length = trail.length = 0;
    if (forget) { try { Object.keys(localStorage).filter((k) => k.startsWith(KEY)).forEach((k) => localStorage.removeItem(k)); } catch { /* none */ } }
  }

  let lastOptions = null;
  function setUserEnabled(on) {
    store.set("off", on ? null : "1");
    if (!on) destroy();
    else if (lastOptions && !host) start(lastOptions);
    return on;
  }

  window.Snaglist = {
    version: VERSION,
    start: (options) => { lastOptions = options || {}; return start(lastOptions); },
    destroy,
    open: () => startPicking(),
    report: (element) => { if (config) openForm(describe(element || document.body)); },
    isUserEnabled: userEnabled,
    setUserEnabled,
    presets: { categories: CATEGORIES, severities: SEVERITIES },
    redact: (text) => (config ? redact(text) : text),
  };

  // Start from the script tag's data attributes, when it has any.
  const tag = document.currentScript;
  if (tag && (tag.dataset.github || tag.dataset.email || tag.dataset.endpoint || tag.dataset.start != null)) {
    const go = () => window.Snaglist.start({
      app: tag.dataset.app || "", version: tag.dataset.version || "",
      send: { github: tag.dataset.github ? { repo: tag.dataset.github } : null, email: tag.dataset.email ? { to: tag.dataset.email } : null,
        endpoint: tag.dataset.endpoint ? { url: tag.dataset.endpoint } : null },
    });
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go, { once: true }) : go();
  }
})();
