/* Motion for the site. The theme is the cut: blade-straight wipes, headlines that
   rise from behind a line, and shears that snip across the page as you scroll.
   Skipped for visitors who ask for reduced motion, or if GSAP can't load. */
(function () {
  "use strict";
  const root = document.documentElement;
  if (!root.classList.contains("anim")) return;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove("anim"); return; }
  gsap.registerPlugin(ScrollTrigger);

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const once = (trigger, start = "top 85%") => ({ trigger, start, once: true });

  // Wrap each word in a mask so it can rise from behind a line.
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.replaceChildren();
    return words.map((word, i) => {
      const mask = document.createElement("span");
      const inner = document.createElement("span");
      mask.className = "w";
      inner.className = "w__in";
      inner.textContent = word;
      mask.append(inner);
      el.append(mask);
      if (i < words.length - 1) el.append(" ");
      return inner;
    });
  }

  function riseWords(el) {
    gsap.from(splitWords(el), {
      yPercent: 115, duration: 1.1, stagger: 0.06, ease: "expo.out",
      scrollTrigger: once(el, "top 90%"),
    });
  }

  function rise(selector) {
    const els = $$(selector);
    if (!els.length) return;
    gsap.from(els, {
      y: 18, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out",
      clearProps: "transform,opacity", scrollTrigger: once(els[0], "top 92%"),
    });
  }

  function wipe(target, from, trigger, vars = {}) {
    gsap.fromTo(target, { clipPath: from }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut",
      clearProps: "clipPath", scrollTrigger: once(trigger, "top 82%"), ...vars,
    });
  }

  /* ---------- Page load ---------- */
  const strokes = $$(".logo__mark path");
  const heroImg = $(".hero__photo img");
  gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(strokes, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: "power2.inOut" }, 0)
    .set(strokes, { strokeDasharray: "none" })
    .from(".logo__sub", { opacity: 0, y: 6, duration: 0.7 }, 0.6)
    .fromTo(heroImg, { clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" }, 0.1)
    .from(heroImg, { scale: 1.22, duration: 2 }, 0.1)
    .from(".hero .script", { x: -18, opacity: 0, duration: 0.9 }, 0.35)
    .from(splitWords($(".hero h1")), { yPercent: 115, duration: 1.15, stagger: 0.075 }, 0.45)
    .from(".hero__lead", { y: 16, opacity: 0, duration: 0.9 }, 0.95)
    .from(".hero__actions > *", { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, clearProps: "transform,opacity" }, 1.05)
    .from(".seal", { scale: 0, rotation: -120, transformOrigin: "50% 50%", duration: 1, ease: "back.out(1.5)" }, 1.05);
  root.classList.remove("anim");

  gsap.to(".seal__text", {
    rotation: 360, svgOrigin: "100 100", ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "+=1000", scrub: 0.6 },
  });

  /* ---------- About ---------- */
  riseWords($(".about h2"));
  rise(".about__text p, .about__text .btn");
  wipe(".about__img", "inset(0% 100% 0% 0%)", ".about__img");
  gsap.from(".about__img", { scale: 1.14, duration: 1.8, ease: "expo.out", scrollTrigger: once(".about__img", "top 82%") });

  /* ---------- Shears cutting along the dashed line ---------- */
  const snip = $(".snip"), shears = $(".snip__shears"), line = $(".snip__line");
  const bladeA = $(".snip__a"), bladeB = $(".snip__b");
  const state = { p: 0 };
  const drawSnip = () => {
    const travel = snip.clientWidth - shears.clientWidth;
    const x = travel * state.p;
    const angle = 26 * Math.abs(Math.sin(state.p * Math.PI * 9));
    shears.style.transform = `translate3d(${x}px, 0, 0)`;
    line.style.clipPath = `inset(0 0 0 ${x + 24}px)`;
    bladeA.setAttribute("transform", `rotate(${angle} 20 16)`);
    bladeB.setAttribute("transform", `rotate(${-angle} 20 16)`);
  };
  gsap.to(state, {
    p: 1, ease: "none", onUpdate: drawSnip,
    scrollTrigger: { trigger: snip, start: "top 92%", end: "top 30%", scrub: 0.5, onRefresh: drawSnip },
  });

  /* ---------- Services ---------- */
  riseWords($(".services h2"));
  rise(".services__head p");
  wipe(".menu li", "inset(0% 100% 0% 0%)", "#menu", { duration: 0.9, stagger: 0.08, ease: "power3.inOut" });

  /* ---------- Reviews ---------- */
  riseWords($(".reviews h2"));
  const score = $("#score"), count = { v: 0 };
  score.textContent = "0.0";
  gsap.to(count, {
    v: window.SHOP.rating, duration: 1.7, ease: "power2.out",
    onUpdate: () => { score.textContent = count.v.toFixed(1); },
    scrollTrigger: once(score, "top 88%"),
  });
  rise("#scoreText, .reviews__link");
  rise("#quotes li");

  /* ---------- Gallery ---------- */
  riseWords($(".gallery h2"));
  wipe(".gal", "inset(100% 0% 0% 0%)", ".gallery__grid", { duration: 1.2, stagger: 0.12 });

  /* ---------- Booking ---------- */
  riseWords($(".book h2"));
  rise(".book__intro p");
  gsap.from(".form", { y: 36, opacity: 0, duration: 1, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: once(".form") });

  /* ---------- Visit ---------- */
  riseWords($(".visit h2"));
  rise(".visit__text > h3, .visit__text > address, .visit__note, .visit__links, .visit__text > p");
  rise(".visit__row > *");
  wipe(".visit__map", "inset(0% 0% 0% 100%)", ".visit");

  /* ---------- Parallax, large screens only ---------- */
  gsap.matchMedia().add("(min-width: 900px)", () => {
    gsap.to(heroImg, {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.fromTo(".about__post", { y: 90 }, {
      y: -90, ease: "none",
      scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true },
    });
    $$(".gal img").forEach((img, i) => {
      gsap.fromTo(img, { yPercent: i % 2 ? -11 : -4 }, {
        yPercent: i % 2 ? 0 : -9, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  });

  /* ---------- Booking form feedback ---------- */
  document.addEventListener("envy:step", (e) => {
    // Opacity only: hiding the step would drop keyboard focus from its heading.
    gsap.fromTo(`fieldset[data-step="${e.detail.n}"]`, { x: e.detail.dir * 36, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", clearProps: "transform,opacity" });
    ScrollTrigger.refresh();
  });
  document.addEventListener("envy:done", () => {
    gsap.fromTo("#done", { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", clearProps: "transform,opacity" });
  });
  $("#date").addEventListener("change", () => {
    gsap.from("#slots .choice", { opacity: 0, y: 8, duration: 0.35, stagger: 0.012, ease: "power2.out", clearProps: "transform,opacity" });
  });

  /* ---------- Keep trigger positions right ---------- */
  $("#lang").addEventListener("click", () => setTimeout(() => ScrollTrigger.refresh(), 50));
  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
