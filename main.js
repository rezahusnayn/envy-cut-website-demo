(function () {
  "use strict";
  const S = window.SHOP, I = window.I18N;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    n.append(...kids);
    return n;
  };

  const store = {
    get() { try { return localStorage.getItem("lang"); } catch { return null; } },
    set(v) { try { localStorage.setItem("lang", v); } catch { /* private mode */ } },
  };
  let lang = store.get() === "ms" ? "ms" : "en";
  let step = 1;
  let waUrl = "";

  const t = (key, vars = {}) =>
    I[lang][key].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  const rm = (n) => "RM" + (Number.isInteger(n) ? n : n.toFixed(2));
  const price = (s) => (s.from ? `${t("from")} ` : "") + rm(s.price);
  const wa = (text) =>
    `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const locale = () => (lang === "ms" ? "ms-MY" : "en-MY");
  const toMins = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const clock = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  const service = () => S.services.find((s) => s.id === ($('input[name="service"]:checked') || {}).value);
  const slot = () => ($('input[name="slot"]:checked') || {}).value;

  /* ---------- Rendering ---------- */
  function renderMenu() {
    $("#menu").replaceChildren(...S.services.map((s) => {
      const book = el("a", { className: "menu__book", href: "#book", textContent: t("bookThis") });
      book.setAttribute("aria-label", `${t("bookThis")}: ${s[lang].name}`);
      book.addEventListener("click", () => pickService(s.id));
      return el("li", {},
        el("span", { className: "menu__name", textContent: s[lang].name }),
        el("span", { className: "menu__note", textContent: `${s[lang].note}. ${s.mins} ${t("minutes")}` }),
        el("span", { className: "menu__price", textContent: price(s) }),
        book);
    }));
  }

  function renderReviews() {
    $("#score").textContent = S.rating;
    $("#scoreText").textContent = t("ratingText", { count: S.reviewCount });
    $("#quotes").replaceChildren(...S.reviews.map((r) =>
      el("li", {},
        el("blockquote", { textContent: r.text }),
        el("p", { textContent: `${r.name}, ${t("reviewSource")}` }))));
  }

  function renderServiceChoices() {
    const current = (service() || {}).id;
    $("#serviceChoices").replaceChildren(...S.services.map((s) => {
      const input = el("input", { type: "radio", name: "service", value: s.id, checked: s.id === current });
      return el("label", { className: "choice" }, input,
        el("span", {}, s[lang].name, el("small", { textContent: price(s) })));
    }));
  }

  function renderBarberSelect() {
    const current = $("#barber").value;
    $("#barber").replaceChildren(
      el("option", { value: "", textContent: t("anyBarber") }),
      ...S.stylists.map((name) => el("option", { value: name, textContent: name })));
    $("#barber").value = current;
  }

  function renderSlots() {
    const box = $("#slots");
    const chosen = slot();
    const value = $("#date").value;
    const note = (text) => box.replaceChildren(el("p", { textContent: text }));
    if (!value) return note(t("pickDateFirst"));
    const date = fromISO(value);
    const hours = S.hours[date.getDay()];
    if (!hours || value < toISO(new Date())) return box.replaceChildren();
    const now = new Date();
    const earliest = value === toISO(now) ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
    const times = [];
    for (let m = toMins(hours[0]); m + S.slotMinutes <= toMins(hours[1]); m += S.slotMinutes) {
      if (m >= earliest) times.push(clock(m));
    }
    box.replaceChildren(...times.map((time) =>
      el("label", { className: "choice" },
        el("input", { type: "radio", name: "slot", value: time, checked: time === chosen }),
        el("span", { textContent: time }))));
  }

  function renderHours() {
    const order = [1, 2, 3, 4, 5, 6, 0];
    const fmt = new Intl.DateTimeFormat(locale(), { weekday: "long" });
    const kids = [];
    order.forEach((day) => {
      const name = fmt.format(new Date(2024, 0, 7 + day)); // 7 Jan 2024 was a Sunday
      const h = S.hours[day];
      kids.push(el("dt", { textContent: name }), el("dd", { textContent: h ? `${h[0]} ${t("until")} ${h[1]}` : t("closed") }));
    });
    $("#hours").replaceChildren(...kids);
  }

  function whenText() {
    if (!$("#date").value || !slot()) return "";
    const d = new Intl.DateTimeFormat(locale(), { weekday: "long", day: "numeric", month: "long" }).format(fromISO($("#date").value));
    return `${d}, ${slot()}`;
  }

  function renderSummary() {
    const s = service();
    if (!s) return;
    const rows = [
      [t("sumService"), s[lang].name],
      [t("sumBarber"), $("#barber").value || t("anyBarber")],
      [t("sumWhen"), whenText()],
      [t("sumPrice"), price(s)],
    ];
    $("#summary").replaceChildren(...rows.flatMap(([k, v]) => [el("dt", { textContent: k }), el("dd", { textContent: v })]));
  }

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    $$("[data-i18n-alt]").forEach((n) => { n.alt = t(n.dataset.i18nAlt); });
    $$("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); });
    const sw = $("#lang");
    sw.textContent = t("langSwitch");
    sw.lang = lang === "en" ? "ms" : "en";
    sw.setAttribute("aria-label", t("langName"));
    $$("[data-wa]").forEach((a) => { a.href = wa(t("enquiry", { shop: S.name })); });
    renderMenu(); renderReviews(); renderServiceChoices(); renderBarberSelect(); renderSlots(); renderHours();
    showStep(step, false);
    if (step === 3) renderSummary();
    clearErrors();
  }

  /* ---------- Errors ---------- */
  function setErr(id, msg, field) {
    const n = $("#" + id);
    n.textContent = msg;
    n.hidden = false;
    if (field) field.setAttribute("aria-invalid", "true");
  }
  function clearErrors() {
    $$(".err").forEach((n) => { n.hidden = true; n.textContent = ""; });
    $$("[aria-invalid]").forEach((n) => n.removeAttribute("aria-invalid"));
  }

  /* ---------- Validation ---------- */
  function dateProblem() {
    const value = $("#date").value;
    if (!value) return "errDate";
    if (value < toISO(new Date())) return "errPast";
    const day = fromISO(value).getDay();
    if (!S.hours[day]) return "errClosed";
    if (!$('input[name="slot"]')) return "errNoSlots";
    return null;
  }

  function validate() {
    clearErrors();
    if (step === 1) {
      const s = service();
      if (!s) { setErr("errService", t("errService")); return $('input[name="service"]'); }
    }
    if (step === 2) {
      const problem = dateProblem();
      if (problem) { setErr("errDate", t(problem), $("#date")); return $("#date"); }
      if (!slot()) { setErr("errTime", t("errTime")); return $('input[name="slot"]'); }
    }
    if (step === 3) {
      let first = null;
      if (!$("#name").value.trim()) { setErr("errName", t("errName"), $("#name")); first = $("#name"); }
      const phone = $("#phone").value.replace(/[\s()-]/g, "");
      if (!/^(\+?6?0)\d{8,10}$/.test(phone)) { setErr("errPhone", t("errPhone"), $("#phone")); first = first || $("#phone"); }
      return first;
    }
    return null;
  }

  /* ---------- Steps ---------- */
  function showStep(n, moveFocus = true) {
    const dir = n >= step ? 1 : -1;
    step = n;
    $$("fieldset[data-step]").forEach((f) => { f.hidden = Number(f.dataset.step) !== n; });
    $$("#steps li").forEach((li, i) => {
      li.classList.toggle("is-on", i < n);
      if (i === n - 1) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("#stepCount").textContent = t("stepOf", { n });
    $("#back").hidden = n === 1;
    $("#next").textContent = n === 3 ? t("send") : t("next");
    if (moveFocus) {
      $(`fieldset[data-step="${n}"] legend`).focus({ preventScroll: true });
      document.dispatchEvent(new CustomEvent("envy:step", { detail: { n, dir } }));
    }
  }

  function pickService(id) {
    resetDone();
    const input = $(`input[name="service"][value="${id}"]`);
    if (input) input.checked = true;
    clearErrors();
    showStep(1, false);
  }

  function resetDone() {
    $("#form").classList.remove("is-done");
    $("#done").hidden = true;
  }

  function buildMessage() {
    const s = service();
    const lines = [
      t("msgIntro", { shop: S.name }),
      "",
      `${t("sumService")}: ${s[lang].name}`,
      `${t("sumBarber")}: ${$("#barber").value || t("anyBarber")}`,
      `${t("sumWhen")}: ${whenText()}`,
      `${t("sumPrice")}: ${price(s)}`,
    ];
    lines.push("", `${t("msgName")}: ${$("#name").value.trim()}`, `${t("msgPhone")}: ${$("#phone").value.trim()}`);
    const notes = $("#notes").value.trim();
    if (notes) lines.push(`${t("msgNotes")}: ${notes}`);
    return lines.join("\n");
  }

  /* ---------- Events ---------- */
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = validate();
    if (bad) { bad.focus(); return; }
    if (step < 3) {
      showStep(step + 1);
      if (step === 3) renderSummary();
      return;
    }
    waUrl = wa(buildMessage());
    $("#reopen").href = waUrl;
    window.open(waUrl, "_blank", "noopener");
    $("#form").classList.add("is-done");
    $("#done").hidden = false;
    $("#done h3").focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("envy:done"));
  });

  $("#back").addEventListener("click", () => { clearErrors(); showStep(step - 1); });

  $("#another").addEventListener("click", () => {
    $("#form").reset();
    resetDone();
    clearErrors();
    renderSlots();
    showStep(1);
  });

  $("#date").addEventListener("change", () => {
    clearErrors();
    renderSlots();
    const problem = $("#date").value ? dateProblem() : null;
    if (problem) setErr("errDate", t(problem), $("#date"));
  });

  $("#lang").addEventListener("click", () => {
    lang = lang === "en" ? "ms" : "en";
    store.set(lang);
    applyLang();
  });

  const menuBtn = $(".top__menu"), nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
  });

  /* The pole turns with the page: one stripe cycle is 88px along the diagonal. */
  const stripes = $(".rail__stripes");
  if (stripes && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const period = 88 * Math.SQRT2;
    let queued = false;
    addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        stripes.style.transform = `translate3d(0, ${(scrollY * 0.5) % period}px, 0)`;
        queued = false;
      });
    }, { passive: true });
  }

  /* ---------- Static details from config ---------- */
  $$('[data-shop="name"]').forEach((n) => { n.textContent = S.name; });
  $$('[data-shop="address"]').forEach((n) => { n.textContent = S.address; });
  $(".logo").setAttribute("aria-label", S.name);
  $("#sealText").textContent = `${S.name.toUpperCase()}  *  TAMAN MELAWATI  *`;
  $("#tel").textContent = S.phone;
  $("#tel").href = `tel:${S.phoneHref}`;
  $("#preview").hidden = !S.isPlaceholder;
  $("#year").textContent = new Date().getFullYear();
  $("#date").min = toISO(new Date());

  const place = encodeURIComponent(S.mapQuery);
  const dirs = `https://www.google.com/maps/dir/?api=1&destination=${place}`;
  $("#gmaps").href = dirs;
  $("#barMaps").href = dirs;
  $("#reviewsLink").href = `https://www.google.com/maps/search/?api=1&query=${place}`;
  $("#waze").href = `https://waze.com/ul?q=${place}&navigate=yes`;
  $("#map").src = `https://maps.google.com/maps?q=${place}&z=15&output=embed`;

  if (!S.isPlaceholder) {
    const hoursSpec = Object.entries(S.hours).filter(([, h]) => h).map(([d, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d],
      opens: h[0], closes: h[1],
    }));
    document.head.append(el("script", {
      type: "application/ld+json",
      textContent: JSON.stringify({
        "@context": "https://schema.org", "@type": "HairSalon", name: S.name,
        address: S.address, telephone: S.phoneHref,
        aggregateRating: { "@type": "AggregateRating", ratingValue: S.rating, reviewCount: S.reviewCount },
        openingHoursSpecification: hoursSpec,
      }),
    }));
  }

  applyLang();
})();
