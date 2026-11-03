/*
 * Snaglist 0.2.0: report a UX issue or a bug on any page, tagged with the page and the part of it, with the
 * technical detail needed to fix it and without personal information. One file, no libraries, MIT licence.
 * https://github.com/TheMightyTRex/snaglist
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

  const VERSION = "0.2.0";
  const KEY = "snaglist:";

  // Report types. Each has its own questions and the technical detail it records. A field is
  // { id, label, hint, type: "textarea" | "text" | "select", options: [[value, label]], required }.
  const WHAT = { id: "what", label: "What is wrong", hint: "What did you expect, and what happened?", type: "textarea", required: true };
  const TYPES = {
    bug: { label: "Something is broken", hint: "An error, a button that does nothing, wrong data",
      fields: [
        { id: "actual", label: "What happened", hint: "Include any message you saw, word for word.", type: "textarea", required: true },
        { id: "expected", label: "What you expected", type: "textarea" },
        { id: "steps", label: "Steps to make it happen again", hint: "One step per line, starting from the page.", type: "textarea" },
        { id: "repeat", label: "Does it happen every time", type: "select", options: [["always", "Every time"], ["sometimes", "Sometimes"], ["once", "Only once so far"]] },
      ],
      collect: ["element", "errors", "console", "network", "trail", "html"] },
    ux: { label: "Hard to use", hint: "Confusing, too many steps, not where you expected",
      fields: [WHAT], collect: ["element", "trail"] },
    visual: { label: "Looks wrong", hint: "Overlaps, cut off, misaligned, wrong colour or size",
      fields: [WHAT], collect: ["element", "styles", "layout", "html"] },
    accessibility: { label: "Accessibility", hint: "Keyboard, screen reader, zoom, contrast, motion",
      fields: [WHAT, { id: "using", label: "What were you using", type: "select", options: [["keyboard", "Keyboard only"],
        ["screen-reader", "A screen reader"], ["zoom", "Zoom or large text"], ["voice", "Voice control"], ["switch", "Switch access"],
        ["contrast", "High contrast or forced colours"], ["none", "Nothing special"], ["other", "Something else"]] }],
      collect: ["element", "a11y", "styles", "layout"] },
    performance: { label: "Slow", hint: "Takes too long to load, freezes or stutters",
      fields: [WHAT, { id: "when", label: "When is it slow", type: "select", options: [["load", "While the page loads"],
        ["action", "After I do something"], ["always", "All the time"]] }],
      collect: ["performance", "network", "trail"] },
    content: { label: "Words are wrong", hint: "Spelling, unclear or out-of-date text",
      fields: [WHAT, { id: "suggestion", label: "Suggested wording", type: "textarea" }], collect: ["element"] },
    idea: { label: "Idea", hint: "A suggestion, not a fault", fields: [{ ...WHAT, label: "Your idea", hint: "What would make this better?" }], collect: [] },
  };

  // Optional second question, "Kind of issue". A category is [value, label, hint].
  const CATEGORIES = {
    ux: [
      ["layout", "Layout", "Overlaps, alignment, spacing, things cut off"],
      ["words", "Words", "Unclear, wrong or inconsistent text"],
      ["behaviour", "Behaviour", "Does not do what you expected"],
      ["accessibility", "Accessibility", "Keyboard, screen reader, contrast, zoom"],
      ["looks", "Looks", "Colour, icons, type, not like the rest"],
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

  // What a report can record. true: always; false: never; "auto": when the report type asks for it.
  const PARTS = [
    ["page", "Page name and path"], ["element", "The part of the page"], ["styles", "Its font and colours"],
    ["layout", "Its size, position and what covers it"], ["a11y", "Its accessibility details"], ["html", "Its HTML, without text"],
    ["environment", "Screen, browser and device"], ["display", "Display settings"], ["performance", "Page speed"],
    ["errors", "Script errors"], ["console", "Console messages"], ["network", "Failed and slow requests"],
    ["trail", "What was selected before"], ["context", "App details"],
  ];
  const BACKGROUND = ["errors", "console", "network", "trail", "performance"]; // these record from the start

  const DEFAULTS = {
    app: "",
    version: "",
    enabled: true,
    userToggle: true,
    launcher: "bottom-right",
    shortcut: "",
    types: ["bug", "ux", "visual", "accessibility", "performance", "content", "idea"],
    categories: null,
    severities: "three",
    labels: ["ux-report"],
    collect: {
      page: true, element: "auto", styles: "auto", layout: "auto", a11y: "auto", html: "auto",
      environment: true, display: true, performance: "auto",
      errors: "auto", console: "auto", network: "auto", trail: "auto", context: true,
    },
    limits: { errors: 5, console: 10, network: 8, trail: 8, slowRequest: 2000 },
    page: { name: null, keepParams: [] },
    component: { attribute: "data-component", from: null },
    context: null,
    redact: [],
    send: { github: null, email: null, endpoint: null, copy: true, download: true },
    beforeSend: null,
    text: {},
  };

  const TEXT = {
    launcher: "Report an issue",
    pickPrompt: "Choose the part with the issue: select it, or Tab to it and press Enter. Escape stops.",
    wholePage: "Whole page",
    stop: "Stop",
    formTitle: "Report an issue",
    where: "Where",
    chooseAgain: "Choose again",
    type: "What kind of report",
    fieldError: "Fill this in",
    category: "Kind of issue",
    severity: "How bad is it",
    review: "Review what is sent",
    cancel: "Cancel",
    reviewTitle: "What is sent",
    include: "Include",
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
    copiedForGithub: "The technical details were too long for GitHub's address, so the full report is on your clipboard: paste it into the issue.",
    sent: "Report sent. Thank you.",
    sendFailed: "Not sent",
    opened: "Opened. Thank you.",
  };

  let config = null;
  let host = null;
  let root = null;
  let wrap = null;
  let launcher = null;
  let picking = null;
  let lastFocus = null;
  const buffers = { errors: [], console: [], network: [], trail: [], longTasks: [], resources: [] };
  const vitals = { lcp: null, cls: 0, inp: null };
  const undo = []; // functions that take back everything start() added to the page

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
  const isPlain = (v) => v && typeof v === "object" && !Array.isArray(v) && typeof v !== "function";
  const merge = (base, extra) => {
    const out = { ...base };
    for (const [k, v] of Object.entries(extra || {})) if (v !== undefined) out[k] = isPlain(v) && isPlain(base[k]) ? merge(base[k], v) : v;
    return out;
  };
  const ours = (event) => event.composedPath().includes(host);
  const list = (value, presets) => (Array.isArray(value) ? value : presets[value] || null);
  const push = (buffer, item, max = 30) => { buffer.push(item); if (buffer.length > max) buffer.shift(); };
  const ms = (n) => (n == null ? undefined : `${Math.round(n)} ms`);

  // Anonymity --------------------------------------------------------------------------------------------

  const PATTERNS = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]"],
    [/\b(?:ghp|gho|github_pat|sk|pk|xox[bap])[-_][A-Za-z0-9_-]{8,}/g, "[key]"],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[key]"],
    [/\b(?:bearer|token|api[_-]?key|password|secret)\s*[:=]\s*\S+/gi, "[key]"],
    [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[address]"],
    [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]"],
    [/\b[A-Za-z0-9_-]*\d[A-Za-z0-9_-]*[A-Za-z][A-Za-z0-9_-]{22,}\b/g, "[key]"],
    [/\+?\d[\d ()-]{5,}\d/g, "[number]"],
  ];
  function redact(text) {
    let out = String(text ?? "");
    for (const [pattern, label] of [...PATTERNS, ...(config ? config.redact : [])]) out = out.replace(pattern, label);
    return out;
  }
  const clip = (text, n) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

  const idLike = (s) => /^\d+$/.test(s) || /^[0-9a-f-]{8,}$/i.test(s) || /@/.test(s) || (/\d/.test(s) && s.length >= 16);
  function cleanPath(pathname) {
    return pathname.split("/").map((s) => { let raw = s; try { raw = decodeURIComponent(s); } catch { /* keep */ } return idLike(raw) ? ":id" : raw; }).join("/");
  }
  function pathPattern() {
    const params = new URLSearchParams(location.search);
    const kept = config.page.keepParams.filter((k) => params.has(k)).map((k) => `${k}=${redact(params.get(k))}`);
    return cleanPath(location.pathname) + (kept.length ? `?${kept.join("&")}` : "");
  }
  // A request's address without its query, hash or ids; the host only when it is another site.
  function cleanUrl(url) {
    try {
      const u = new URL(url, location.href);
      return (u.origin === location.origin ? "" : u.host) + cleanPath(u.pathname);
    } catch { return "[address]"; }
  }

  function browserAndSystem() {
    const ua = navigator.userAgent;
    const browser = [[/Edg\/(\d+)/, "Edge"], [/OPR\/(\d+)/, "Opera"], [/Firefox\/(\d+)/, "Firefox"], [/Chrome\/(\d+)/, "Chrome"],
      [/Version\/(\d+).*Safari/, "Safari"]].map(([re, name]) => { const m = ua.match(re); return m && `${name} ${m[1]}`; }).find(Boolean) || "Other";
    const system = [[/Android/, "Android"], [/iPhone|iPad|iPod/, "iOS"], [/Mac OS X|Macintosh/, "macOS"], [/Windows/, "Windows"],
      [/CrOS/, "ChromeOS"], [/Linux/, "Linux"]].find(([re]) => re.test(ua))?.[1] || "Other";
    return { browser, system };
  }

  // Recording in the background, only what reports can use, kept in memory on this page only ------------------

  function on(target, type, fn, opts = true) { target.addEventListener(type, fn, opts); undo.push(() => target.removeEventListener(type, fn, opts)); }
  const wanted = (part) => config.collect[part] !== false;

  function stackLines(stack) {
    return String(stack || "").split("\n").slice(1, 4).map((l) => redact(l.trim().replace(/\?[^:)\s]*/g, "").replace(/https?:\/\/[^/]+/g, ""))).filter(Boolean);
  }

  function record() {
    const lim = config.limits;
    if (wanted("errors")) {
      on(window, "error", (e) => {
        const target = e.target;
        if (target && target !== window && target.tagName) { // a picture, script or style sheet that did not load
          push(buffers.resources, `${target.tagName.toLowerCase()} did not load: ${cleanUrl(target.src || target.href || "")}`, 10);
          return;
        }
        push(buffers.errors, { message: clip(redact(e.message || "Error"), 300),
          where: e.filename ? `${cleanUrl(e.filename)}:${e.lineno}:${e.colno}` : undefined, stack: stackLines(e.error?.stack) }, lim.errors * 2);
      });
      on(window, "unhandledrejection", (e) => push(buffers.errors, { message: clip(redact(`Unhandled promise: ${e.reason?.message || e.reason}`), 300),
        stack: stackLines(e.reason?.stack) }, lim.errors * 2));
      on(document, "securitypolicyviolation", (e) => push(buffers.errors, { message: `Content Security Policy blocked ${e.effectiveDirective}: ${cleanUrl(e.blockedURI || "")}` }, lim.errors * 2));
    }
    if (wanted("console")) {
      for (const level of ["error", "warn"]) {
        const original = console[level];
        console[level] = function (...args) {
          try {
            const text = args.map((a) => (a instanceof Error ? `${a.name}: ${a.message}` : typeof a === "object" ? (() => { try { return JSON.stringify(a); } catch { return String(a); } })() : String(a))).join(" ");
            push(buffers.console, `${level}: ${clip(redact(text), 300)}`, lim.console * 2);
          } catch { /* never break the page's own logging */ }
          return original.apply(this, args);
        };
        undo.push(() => { console[level] = original; });
      }
    }
    if (wanted("network")) {
      const note = (method, url, status, started) => {
        const duration = performance.now() - started;
        if (status >= 400 || status === 0 || duration > lim.slowRequest) {
          push(buffers.network, { method: String(method || "GET").toUpperCase(), url: cleanUrl(url), status: status || "failed", duration: Math.round(duration) }, lim.network * 2);
        }
      };
      if (window.fetch) {
        const original = window.fetch;
        window.fetch = function (input, init) {
          const started = performance.now();
          const url = typeof input === "string" ? input : input?.url || String(input);
          const method = init?.method || input?.method || "GET";
          return original.apply(this, arguments).then(
            (res) => { note(method, url, res.status, started); return res; },
            (err) => { note(method, url, 0, started); throw err; });
        };
        undo.push(() => { window.fetch = original; });
      }
      const open = XMLHttpRequest.prototype.open;
      const send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (method, url) { this.__snag = { method, url }; return open.apply(this, arguments); };
      XMLHttpRequest.prototype.send = function () {
        const info = this.__snag;
        if (info) { const started = performance.now(); this.addEventListener("loadend", () => note(info.method, info.url, this.status, started), { once: true }); }
        return send.apply(this, arguments);
      };
      undo.push(() => { XMLHttpRequest.prototype.open = open; XMLHttpRequest.prototype.send = send; });
    }
    if (wanted("trail")) {
      on(window, "click", (e) => {
        if (picking || ours(e) || !(e.target instanceof Element)) return;
        const el = e.target.closest("a, button, [role], input, select, textarea, summary, label") || e.target;
        const d = describe(el);
        push(buffers.trail, `Selected ${[d.component, d.role, d.name && `"${d.name}"`].filter(Boolean).join(", ")}`, lim.trail * 2);
      });
      on(window, "change", (e) => {
        if (ours(e) || !(e.target instanceof Element)) return;
        const d = describe(e.target);
        push(buffers.trail, `Changed ${[d.component, d.role, d.name && `"${d.name}"`].filter(Boolean).join(", ")}`, lim.trail * 2);
      });
      on(window, "submit", (e) => { if (!ours(e)) push(buffers.trail, `Sent the form ${componentOf(e.target) || ""}`.trim(), lim.trail * 2); });
      let lastPath = location.pathname;
      const moved = () => { if (location.pathname !== lastPath) { lastPath = location.pathname; push(buffers.trail, `Went to ${cleanPath(lastPath)}`, lim.trail * 2); } };
      on(window, "popstate", moved);
      const timer = setInterval(moved, 1000); // single-page apps change the address without an event
      undo.push(() => clearInterval(timer));
    }
    if (wanted("performance") && "PerformanceObserver" in window) {
      const observe = (type, fn, extra = {}) => {
        try { const o = new PerformanceObserver((l) => l.getEntries().forEach(fn)); o.observe({ type, buffered: true, ...extra }); undo.push(() => o.disconnect()); } catch { /* not supported */ }
      };
      observe("largest-contentful-paint", (e) => { vitals.lcp = e.startTime; });
      observe("layout-shift", (e) => { if (!e.hadRecentInput) vitals.cls += e.value; });
      observe("event", (e) => { if (e.interactionId && (vitals.inp == null || e.duration > vitals.inp)) vitals.inp = e.duration; }, { durationThreshold: 40 });
      observe("longtask", (e) => push(buffers.longTasks, { at: e.startTime, duration: e.duration }, 50));
    }
  }

  // Naming and describing the chosen part --------------------------------------------------------------------

  const ROLES = { a: "link", button: "button", input: "field", select: "choice", textarea: "text box", img: "picture", svg: "icon",
    nav: "menu", header: "header", footer: "footer", main: "main content", aside: "side panel", dialog: "dialog", form: "form",
    table: "table", tr: "table row", td: "table cell", th: "table heading", ul: "list", ol: "list", li: "list item",
    label: "label", p: "text", section: "section", article: "card" };
  const NAMED = new Set(["a", "button", "label", "h1", "h2", "h3", "h4", "h5", "h6", "th", "legend", "summary", "option"]);

  function roleOf(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === "input") return el.type && el.type !== "text" ? `${el.type} field` : "field";
    return el.getAttribute("role") || ROLES[tag] || (/^h[1-6]$/.test(tag) ? `heading ${tag[1]}` : "area");
  }

  // The accessible name, but only for things whose name is a label (buttons, links, headings, fields), never the
  // text of a whole area, which could hold someone's name or messages. Fields give their label, never their value.
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
    const out = { font: `${s.fontSize}, weight ${s.fontWeight}, line height ${s.lineHeight}`, text: fg ? hex(fg) : s.color, background: hex(bg) };
    if (fg) {
      const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      const ratio = (l1 + 0.05) / (l2 + 0.05);
      const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
      out.contrast = `${ratio.toFixed(2)}:1 (${ratio >= (large ? 3 : 4.5) ? "passes" : "fails"} WCAG AA for ${large ? "large" : "normal"} text)`;
    }
    return out;
  }

  function layoutOf(el) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const out = { box: `${Math.round(r.width)}×${Math.round(r.height)} at ${Math.round(r.left)}, ${Math.round(r.top + scrollY)}`,
      display: s.display, position: s.position !== "static" ? s.position : undefined, zIndex: s.zIndex !== "auto" ? s.zIndex : undefined };
    // Content bigger than its box by more than a few pixels: cut off when overflow hides it, spilling out when not.
    if (el.scrollWidth > el.clientWidth + 4 || el.scrollHeight > el.clientHeight + 4) {
      const clipped = [s.overflowX, s.overflowY].some((o) => o !== "visible");
      out.overflow = `content is ${el.scrollWidth}×${el.scrollHeight} in a ${el.clientWidth}×${el.clientHeight} box, ${clipped ? `cut off or scrolling (overflow ${s.overflowX} ${s.overflowY})` : "spilling out"}`;
    }
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) out.onScreen = "not in view when reported";
    else if (r.left < 0 || r.right > innerWidth) out.onScreen = "partly off the side of the page";
    if (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) {
      const top = document.elementFromPoint(x, y);
      if (top && top !== el && !el.contains(top) && top !== host) out.coveredBy = selectorOf(top);
    }
    if (s.visibility !== "visible" || +s.opacity < 0.1) out.hidden = `visibility ${s.visibility}, opacity ${s.opacity}`;
    if (document.documentElement.scrollWidth > innerWidth + 1) out.pageScrollsSideways = `${document.documentElement.scrollWidth} px wide in a ${innerWidth} px window`;
    return out;
  }

  const FOCUSABLE = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]";
  function a11yOf(el) {
    const r = el.getBoundingClientRect();
    const states = ["aria-expanded", "aria-pressed", "aria-checked", "aria-selected", "aria-current", "aria-invalid", "aria-disabled", "aria-busy", "aria-live"]
      .filter((a) => el.hasAttribute(a)).map((a) => `${a.slice(5)}=${el.getAttribute(a)}`);
    if (el.disabled) states.push("disabled");
    if (el.required) states.push("required");
    if (el.checked) states.push("checked");
    const hiddenBy = el.closest("[aria-hidden='true'], [inert]");
    const landmark = el.closest("main, nav, header, footer, aside, form, dialog, [role=dialog], [role=region], [role=navigation], [role=main]");
    const out = {
      role: el.getAttribute("role") || roleOf(el), name: nameOf(el) || "none",
      states: states.join(", ") || undefined,
      focusable: el.matches(FOCUSABLE) && el.tabIndex >= 0 ? `yes${el.hasAttribute("tabindex") ? `, tabindex ${el.getAttribute("tabindex")}` : ""}` : el.matches(FOCUSABLE) ? "only by script (tabindex -1)" : "no",
      target: `${Math.round(r.width)}×${Math.round(r.height)} px${el.matches(FOCUSABLE) && (r.width < 24 || r.height < 24) ? " (under the 24×24 px minimum in WCAG 2.5.8)" : ""}`,
      hidden: hiddenBy ? `inside ${hiddenBy.hasAttribute("inert") ? "an inert" : "an aria-hidden"} element` : undefined,
      landmark: landmark ? `${landmark.getAttribute("role") || landmark.tagName.toLowerCase()}${landmark.getAttribute("aria-label") ? ` "${clip(redact(landmark.getAttribute("aria-label")), 40)}"` : ""}` : "none",
      language: document.documentElement.lang || "not set",
    };
    if (el.tagName === "IMG" && !el.hasAttribute("alt")) out.problem = "picture with no alt attribute";
    if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) && !(el.labels && el.labels.length) && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) out.problem = "field with no label";
    return out;
  }

  // The part's HTML with every bit of text and every value taken out, so the structure shows without the content.
  const SAFE_ATTRS = /^(id|class|role|type|name|for|tabindex|disabled|hidden|href|src|alt|aria-[a-z]+|data-component|data-testid)$/;
  function htmlOf(el) {
    if (el.closest("[data-snag-private]")) return "[private]";
    const copy = el.cloneNode(true);
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) { const n = child.textContent.trim().length; child.textContent = n ? `…${n > 1 ? `(${n})` : ""}` : child.textContent; }
        else if (child.nodeType === 1) {
          if (child.hasAttribute("data-snag-private") || /^(script|style|svg)$/i.test(child.tagName)) { child.replaceWith(document.createComment(child.tagName.toLowerCase())); continue; }
          clean(child); walk(child);
        } else child.remove();
      }
    };
    const clean = (node) => {
      for (const a of [...node.attributes]) {
        if (!SAFE_ATTRS.test(a.name)) node.removeAttribute(a.name);
        else if (a.name === "href" || a.name === "src") node.setAttribute(a.name, cleanUrl(a.value));
        else if (/^(aria-label|alt|title)$/.test(a.name)) node.setAttribute(a.name, clip(redact(a.value), 60));
      }
      if (/^(INPUT|TEXTAREA)$/.test(node.tagName)) node.removeAttribute("value");
    };
    clean(copy); walk(copy);
    return clip(copy.outerHTML.replace(/\s+/g, " "), 1500);
  }

  function describe(el) {
    if (!el || el === document.body || el === document.documentElement) return { whole: true, label: t("wholePage") };
    const out = { component: componentOf(el), role: roleOf(el), name: nameOf(el), selector: selectorOf(el) };
    out.label = [out.component, out.role, out.name && `"${out.name}"`].filter(Boolean).join(", ");
    out.node = el;
    return out;
  }

  function performanceNow() {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const recent = buffers.longTasks.filter((l) => l.at > performance.now() - 60000);
    const out = {
      load: nav ? `server answered in ${ms(nav.responseStart)}, page ready in ${ms(nav.domContentLoadedEventEnd)}, fully loaded in ${ms(nav.loadEventEnd || undefined) || "not yet"}` : undefined,
      lcp: vitals.lcp != null ? `${ms(vitals.lcp)} (${vitals.lcp <= 2500 ? "good" : vitals.lcp <= 4000 ? "needs improvement" : "poor"})` : undefined,
      cls: `${vitals.cls.toFixed(3)} (${vitals.cls <= 0.1 ? "good" : vitals.cls <= 0.25 ? "needs improvement" : "poor"})`,
      inp: vitals.inp != null ? `${ms(vitals.inp)} slowest interaction (${vitals.inp <= 200 ? "good" : vitals.inp <= 500 ? "needs improvement" : "poor"})` : undefined,
      longTasks: recent.length ? `${recent.length} in the last minute, longest ${ms(Math.max(...recent.map((l) => l.duration)))}` : "none in the last minute",
      timeOnPage: `${Math.round(performance.now() / 1000)} s`,
      memory: performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)} MB of script memory in use` : undefined,
    };
    if (buffers.resources.length) out.notLoaded = buffers.resources.slice(-5).join("; ");
    return out;
  }

  // The report -------------------------------------------------------------------------------------------

  function partsFor(type) {
    const asked = new Set(type.collect || []);
    return PARTS.map(([key]) => key).filter((key) => config.collect[key] === true || (config.collect[key] === "auto" && asked.has(key)));
  }

  function buildReport(part, values, typeKey) {
    const type = types().find(([k]) => k === typeKey)[1];
    const lim = config.limits;
    const report = { tool: `snaglist ${VERSION}`, app: config.app || location.host, version: config.version || undefined, type: typeKey,
      category: values.category, severity: values.severity, answers: {} };
    for (const f of type.fields) if (values[f.id]) report.answers[f.id] = f.type === "select" ? values[f.id] : clip(redact(values[f.id]), 3000);
    const el = part.node;
    for (const key of partsFor(type)) {
      if (key === "page") {
        let name = document.title;
        if (typeof config.page.name === "function") { try { name = config.page.name() || name; } catch { /* keep the title */ } }
        report.page = { name: clip(redact(name), 120), path: pathPattern() };
      }
      if (key === "element") report.element = part.whole ? { whole: true } : { component: part.component, role: part.role, name: part.name, selector: part.selector };
      if (el && key === "styles") report.styles = stylesOf(el);
      if (el && key === "layout") report.layout = layoutOf(el);
      if (el && key === "a11y") report.a11y = a11yOf(el);
      if (el && key === "html") report.html = htmlOf(el);
      if (key === "environment") {
        const { browser, system } = browserAndSystem();
        const c = navigator.connection;
        report.environment = { viewport: `${innerWidth}×${innerHeight}`, screen: `${screen.width}×${screen.height}`, zoom: Math.round(devicePixelRatio * 100) / 100,
          browser, system, language: navigator.language, touch: matchMedia("(pointer: coarse)").matches,
          orientation: screen.orientation?.type?.split("-")[0], online: navigator.onLine,
          connection: c ? `${c.effectiveType || "unknown"}${c.saveData ? ", data saver on" : ""}` : undefined,
          device: navigator.deviceMemory ? `${navigator.deviceMemory} GB memory, ${navigator.hardwareConcurrency} cores` : undefined };
      }
      if (key === "display") {
        const rootEl = document.documentElement;
        const scheme = rootEl.dataset.theme || rootEl.getAttribute("data-color-scheme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark (device)" : "light (device)");
        report.display = { theme: scheme, textSize: getComputedStyle(rootEl).fontSize,
          reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
          moreContrast: matchMedia("(prefers-contrast: more)").matches, forcedColours: matchMedia("(forced-colors: active)").matches };
      }
      if (key === "performance") report.performance = performanceNow();
      if (key === "errors" && buffers.errors.length) report.errors = buffers.errors.slice(-lim.errors);
      if (key === "console" && buffers.console.length) report.console = buffers.console.slice(-lim.console);
      if (key === "network" && buffers.network.length) report.network = buffers.network.slice(-lim.network);
      if (key === "trail" && buffers.trail.length) report.trail = buffers.trail.slice(-lim.trail);
      if (key === "context" && typeof config.context === "function") {
        try {
          const c = config.context();
          if (c && typeof c === "object") report.context = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, clip(redact(typeof v === "string" ? v : JSON.stringify(v)), 200)]));
        } catch { /* the app's own function failed */ }
      }
    }
    report.created = new Date().toISOString().slice(0, 16) + "Z";
    if (typeof config.beforeSend === "function") {
      try { return config.beforeSend(structuredClone(report)) || report; } catch { return report; }
    }
    return report;
  }

  const label = (items, value) => (items?.find(([v]) => v === value) || [value, value])[1];

  function types() {
    return config.types.map((x) => (typeof x === "string" ? [x, TYPES[x]] : [x.id, { collect: [], ...x }])).filter(([, v]) => v);
  }

  function titleOf(report) {
    const type = types().find(([k]) => k === report.type)?.[1];
    const first = (report.answers.what || report.answers.actual || Object.values(report.answers)[0] || type?.label || "").split("\n")[0];
    const where = report.element && !report.element.whole && report.element.component ? `${report.element.component}: ` : "";
    return clip(`${where}${first}`, 90);
  }

  function markdown(report, short) {
    const type = types().find(([k]) => k === report.type)?.[1] || { fields: [] };
    const row = (k, v) => (v === undefined || v === "" || v === false ? null : `| ${k} | ${String(v).replace(/\|/g, "\\|").replace(/\n/g, " ")} |`);
    const table = (obj, names = {}) => ["| | |", "|---|---|", ...Object.entries(obj).map(([k, v]) => row(names[k] || k.replace(/([A-Z])/g, " $1").toLowerCase().replace(/^./, (c) => c.toUpperCase()), v === true ? "yes" : v))].filter(Boolean);
    const out = [];
    for (const f of type.fields) {
      const v = report.answers[f.id];
      if (!v) continue;
      out.push(`**${f.label}**`, f.type === "select" ? label(f.options, v) : v, "");
    }
    out.push("| | |", "|---|---|", row("Report", type.label || report.type));
    if (report.category) out.push(row("Kind", label(list(config.categories, CATEGORIES), report.category)));
    out.push(row("How bad", label(list(config.severities, SEVERITIES), report.severity)), row("App", [report.app, report.version].filter(Boolean).join(" ")));
    if (report.page) out.push(row("Page", report.page.name), row("Path", `\`${report.page.path}\``));
    const e = report.element;
    if (e) {
      if (e.whole) out.push(row("Part", "Whole page"));
      else out.push(row("Component", e.component && `\`${e.component}\``), row("Part", [e.role, e.name && `"${e.name}"`].filter(Boolean).join(", ")), row("Selector", e.selector && `\`${e.selector}\``));
    }
    const env = report.environment;
    if (env) out.push(row("Window", `${env.viewport} (screen ${env.screen}), zoom ${env.zoom}${env.touch ? ", touch" : ""}${env.orientation ? `, ${env.orientation}` : ""}`),
      row("Browser", `${env.browser} on ${env.system}, ${env.language}`), row("Device", [env.device, env.connection && `connection ${env.connection}`, env.online === false && "offline"].filter(Boolean).join(", ")));
    const d = report.display;
    if (d) out.push(row("Display", [d.theme, `text ${d.textSize}`, d.reducedMotion && "reduced motion", d.moreContrast && "more contrast", d.forcedColours && "forced colours"].filter(Boolean).join(", ")));
    out.push(row("Reported", report.created.replace("T", " ")));
    const lines = out.filter((l) => l != null);
    const section = (title, body) => { lines.push("", `**${title}**`, "", ...body); };
    if (short) {
      lines.push("", "_The technical details did not fit in GitHub's address: paste the full report from your clipboard here._");
    } else {
      if (report.styles) section("Styles", table(report.styles));
      if (report.layout) section("Layout", table(report.layout, { coveredBy: "Covered by", onScreen: "On the page", pageScrollsSideways: "Page scrolls sideways" }));
      if (report.a11y) section("Accessibility", table(report.a11y, { a11y: "Accessibility" }));
      if (report.html) section("HTML, with text and values taken out", ["```html", report.html, "```"]);
      if (report.performance) section("Page speed", table(report.performance, { lcp: "Largest paint (LCP)", cls: "Layout shift (CLS)", inp: "Interaction delay (INP)", notLoaded: "Did not load" }));
      if (report.errors) section("Script errors", ["```", ...report.errors.flatMap((x) => [x.message, ...(x.where ? [`  at ${x.where}`] : []), ...(x.stack || []).map((s) => `  ${s}`)]), "```"]);
      if (report.console) section("Console", ["```", ...report.console, "```"]);
      if (report.network) section("Failed and slow requests", ["| Request | Status | Time |", "|---|---|---|", ...report.network.map((n) => `| ${n.method} \`${n.url}\` | ${n.status} | ${n.duration} ms |`)]);
      if (report.trail) section("Before this", report.trail.map((s, i) => `${i + 1}. ${s}`));
      if (report.context) section("App details", table(report.context));
    }
    lines.push("", `<sub>Sent with ${report.tool}. No personal information is kept in this report.</sub>`);
    return lines.join("\n");
  }

  const plain = (md) => md.replace(/^\|---\|---\|(---\|)?$/gm, "").replace(/^\| \| \|$/gm, "").replace(/^\| (.+?) \| (.*) \|$/gm, "$1: $2")
    .replace(/[`*_]|<\/?sub>/g, "").replace(/\n{3,}/g, "\n\n");

  // Sending ----------------------------------------------------------------------------------------------

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const area = h("textarea", { style: "position:fixed;opacity:0" }); area.value = text; wrap.append(area); area.select();
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
    const labels = [...config.labels, ...(g.labels || []), `type: ${report.type}`, report.category && `kind: ${report.category}`, `severity: ${report.severity}`].filter(Boolean).join(",");
    const base = `https://github.com/${g.repo}/issues/new?labels=${encodeURIComponent(labels)}&title=${encodeURIComponent(titleOf(report))}`;
    let url = `${base}&body=${encodeURIComponent(markdown(report))}`;
    if (url.length > 7500) {
      await copyText(markdown(report));
      url = `${base}&body=${encodeURIComponent(markdown(report, true))}`;
      if (url.length > 7500) url = `${base}&body=${encodeURIComponent("Paste the report here: it is on your clipboard.")}`;
      say(t("copiedForGithub"));
    }
    openUrl(url);
    return t("opened");
  }

  async function sendEmail(report) {
    const m = config.send.email;
    let body = plain(markdown(report));
    if (body.length > 1800) { await copyText(body); body = `${clip(plain(markdown(report, true)), 1600)}\n\n(The full report is on your clipboard.)`; }
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
    wrap.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Interface --------------------------------------------------------------------------------------------

  function say(message) {
    const region = wrap.querySelector(".sl-status");
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
    d.addEventListener("close", () => { d.remove(); if (!wrap.querySelector("dialog[open]")) restoreFocus(); });
    wrap.append(d);
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
    wrap.append(outline, banner);
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

  function fieldFor(f, value) {
    const id = `sl-f-${f.id}`;
    const hintId = f.hint ? `${id}-hint` : null;
    const control = f.type === "select"
      ? h("select", { id, name: f.id }, f.options.map(([v, text]) => h("option", { value: v, text, selected: v === value })))
      : h(f.type === "text" ? "input" : "textarea", { id, name: f.id, rows: f.type === "text" ? null : 3, type: f.type === "text" ? "text" : null,
        required: !!f.required, "aria-describedby": hintId });
    if (f.type !== "select" && value) control.value = value;
    const error = f.required ? h("p", { class: "sl-error", id: `${id}-error`, hidden: true, text: t("fieldError") }) : null;
    return h("div", { class: "sl-field" }, h("label", { class: "sl-label", for: id, text: f.label }),
      f.hint ? h("p", { class: "sl-muted", id: hintId, text: f.hint }) : null, error, control);
  }

  function openForm(part, previous = {}) {
    const all = types();
    const typeKey = previous.type && all.some(([k]) => k === previous.type) ? previous.type : all[0][0];
    const cats = list(config.categories, CATEGORIES);
    const sevs = list(config.severities, SEVERITIES) || SEVERITIES.three;
    const fields = h("div", { class: "sl-form" });
    const drawFields = (key, values) => {
      const type = all.find(([k]) => k === key)[1];
      fields.replaceChildren(...type.fields.map((f) => fieldFor(f, values[f.id])));
    };
    const typeGroup = all.length > 1 ? choiceGroup("type", all.map(([k, v]) => [k, v.label, v.hint]), typeKey, t("type")) : null;
    const category = cats ? h("select", { id: "sl-category", name: "category" },
      cats.map(([value, text, hint]) => h("option", { value, text: hint ? `${text}: ${hint}` : text, selected: value === previous.category }))) : null;
    const form = h("form", { id: "sl-form", class: "sl-form", novalidate: true },
      h("div", { class: "sl-field" }, h("span", { class: "sl-label", text: t("where") }), h("p", { class: "sl-where", text: part.label }),
        h("button", { type: "button", class: "sl-link", text: t("chooseAgain"), onclick: () => { d.close(); startPicking(); } })),
      typeGroup, fields,
      category ? h("div", { class: "sl-field" }, h("label", { class: "sl-label", for: "sl-category", text: t("category") }), category) : null,
      choiceGroup("severity", sevs, previous.severity || sevs[Math.min(1, sevs.length - 1)][0], t("severity")));
    drawFields(typeKey, previous);
    typeGroup?.addEventListener("change", (e) => {
      if (e.target.name !== "type") return;
      const kept = Object.fromEntries([...fields.querySelectorAll("[name]")].map((c) => [c.name, c.value]));
      drawFields(e.target.value, kept);
    });
    const next = h("button", { type: "submit", form: "sl-form", class: "sl-btn sl-btn--primary", text: t("review") });
    const d = dialog(t("formTitle"), form, [next, h("button", { type: "button", class: "sl-btn", text: t("cancel"), onclick: () => d.close() })]);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstEmpty = null;
      for (const control of fields.querySelectorAll("[required]")) {
        const empty = !control.value.trim();
        const error = form.querySelector(`#${control.id}-error`);
        error.hidden = !empty;
        control.toggleAttribute("aria-invalid", empty);
        control.setAttribute("aria-describedby", [empty && error.id, control.id + "-hint"].filter((x) => x && form.querySelector(`#${x}`)).join(" "));
        if (empty && !firstEmpty) firstEmpty = control;
      }
      if (firstEmpty) { firstEmpty.focus(); return; }
      const values = Object.fromEntries([...fields.querySelectorAll("[name]")].map((c) => [c.name, c.value.trim()]));
      values.type = form.type ? form.type.value : typeKey;
      values.severity = form.severity.value;
      if (category) values.category = category.value;
      d.close();
      openReview(part, values);
    });
    (fields.querySelector("textarea, input, select") || form.querySelector("input")).focus();
  }

  function openReview(part, values) {
    const full = buildReport(part, values, values.type);
    let report = full;
    const removed = new Set();
    const preview = h("pre", { class: "sl-preview", tabindex: "0", "aria-label": t("reviewTitle") });
    const draw = () => { preview.textContent = markdown(report); };
    const optional = PARTS.filter(([key]) => full[key] !== undefined);
    const toggles = optional.map(([key, text]) =>
      h("label", { class: "sl-check" }, h("input", { type: "checkbox", checked: true, onchange: (e) => {
        e.target.checked ? removed.delete(key) : removed.add(key);
        report = { ...full };
        for (const k of removed) delete report[k];
        draw();
      } }), h("span", { text })));
    draw();
    const s = config.send;
    const notes = [s.github && t("githubNote"), s.email && t("emailNote"), s.endpoint && t("endpointNote")].filter(Boolean);
    const body = [
      h("p", { class: "sl-privacy", text: t("privacy") }),
      toggles.length ? h("fieldset", { class: "sl-checks" }, h("legend", { text: t("include") }), toggles) : null,
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
.sl-dialog { width: min(680px, calc(100vw - 32px)); max-height: calc(100vh - 32px); padding: 0; border: 1px solid var(--bd);
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
input[type=text], textarea, select { width: 100%; min-height: 44px; padding: 8px 12px; border: 1px solid var(--bd); background: var(--bg); border-radius: 0; }
[aria-invalid] { border: 2px solid var(--er) !important; }
fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 4px; }
.sl-choice, .sl-check { display: flex; gap: 12px; align-items: flex-start; min-height: 44px; padding: 8px 0; cursor: pointer; }
.sl-choice input, .sl-check input { width: 22px; height: 22px; margin: 1px 0 0; accent-color: var(--a); flex: none; }
.sl-choice > span { display: grid; }
.sl-choice__name { font-weight: 600; }
.sl-checks { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); column-gap: 16px; }
.sl-checks legend { grid-column: 1 / -1; }
.sl-check { padding: 4px 0; }
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
    if (!types().length) config.types = DEFAULTS.types;
    host = document.createElement("snag-list");
    host.setAttribute("data-snag-private", "");
    root = host.attachShadow({ mode: "open" });
    wrap = h("div", { class: "sl" }, h("div", { class: "sl-status", role: "status", hidden: true }));
    root.append(h("style", { text: CSS_TEXT }), wrap);
    if (config.launcher) {
      launcher = h("button", { type: "button", class: `sl-btn sl-btn--primary sl-launcher sl-launcher--${config.launcher}`, onclick: startPicking },
        icon("flag"), t("launcher"));
      wrap.append(launcher);
    }
    (document.body || document.documentElement).append(host);
    record();
    if (config.shortcut) {
      const parts = config.shortcut.toLowerCase().split("+");
      on(window, "keydown", (e) => {
        if (e.key.toLowerCase() === parts[parts.length - 1] && e.altKey === parts.includes("alt") && e.shiftKey === parts.includes("shift") &&
          e.ctrlKey === parts.includes("ctrl") && e.metaKey === parts.includes("meta")) { e.preventDefault(); startPicking(); }
      });
    }
    return true;
  }

  function destroy({ forget = false } = {}) {
    endPicking(false);
    while (undo.length) { try { undo.pop()(); } catch { /* already gone */ } }
    host?.remove();
    host = root = wrap = launcher = config = null;
    for (const b of Object.values(buffers)) b.length = 0;
    Object.assign(vitals, { lcp: null, cls: 0, inp: null });
    if (forget) { try { Object.keys(localStorage).filter((k) => k.startsWith(KEY)).forEach((k) => localStorage.removeItem(k)); } catch { /* none */ } }
  }

  let lastOptions = null;
  function setUserEnabled(enabled) {
    store.set("off", enabled ? null : "1");
    if (!enabled) destroy();
    else if (lastOptions && !host) start(lastOptions);
    return enabled;
  }

  window.Snaglist = {
    version: VERSION,
    start: (options) => { lastOptions = options || {}; return start(lastOptions); },
    destroy,
    open: () => startPicking(),
    report: (element) => { if (config) openForm(describe(element || document.body)); },
    isUserEnabled: userEnabled,
    setUserEnabled,
    presets: { types: TYPES, categories: CATEGORIES, severities: SEVERITIES },
    redact: (text) => redact(text),
  };

  // Start from the script tag's data attributes, when it has any.
  const tag = document.currentScript;
  if (tag && (tag.dataset.github || tag.dataset.email || tag.dataset.endpoint || tag.dataset.start != null)) {
    const go = () => window.Snaglist.start({
      app: tag.dataset.app || "", version: tag.dataset.version || "",
      types: tag.dataset.types ? tag.dataset.types.split(/[\s,]+/).filter(Boolean) : undefined,
      send: { github: tag.dataset.github ? { repo: tag.dataset.github } : null, email: tag.dataset.email ? { to: tag.dataset.email } : null,
        endpoint: tag.dataset.endpoint ? { url: tag.dataset.endpoint } : null },
    });
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go, { once: true }) : go();
  }
})();
