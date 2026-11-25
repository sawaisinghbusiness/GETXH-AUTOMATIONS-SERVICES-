/* =========================================================
   GetXH Automation — shared site logic
   👉 EDIT YOUR CONTACT DETAILS HERE:
   ========================================================= */
const CONFIG = {
  whatsappNumber: "918239474289", // country code + number, no +, no spaces
  whatsappMessage: "Hi GetXH! I'd like to know how you can help me capture and convert more leads.",
  email: "hello@getxhautomation.in",
  // ---- PLACEHOLDERS — replace these three values with real links ----
  // While a value is still the placeholder, buttons fall back to a safe default
  // (booking → the contact form, demo video → "How it works", intro video → hidden).
  bookingUrl: "BOOKING_URL",       // calendar link for "Book a 15-min call" buttons
  loomUrl: "LOOM_URL",             // 90-second demo video (UK Lettings page)
  loomIntroUrl: "LOOM_INTRO_URL",  // short founder intro video (UK Lettings page)
  // ---- Vapi voice demo (Services page "Talk to Demo AI") ----
  vapiPublicKey: "b8b89f91-fd21-4a27-aac6-a47748d01092", // Vapi PUBLIC key (safe in browser)
  vapiAssistantId: "ebe5e1c5-2a67-4339-b8f1-1729b4e1c546", // the demo assistant to call
};

function whatsappLink(message) {
  return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
}

/* ---- Wire up all WhatsApp links ([data-wa]) ---- */
(function wireWhatsApp() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const message = el.dataset.package
      ? "Hi GetXH! I’m interested in the " + el.dataset.package + " package."
      : CONFIG.whatsappMessage;
    el.href = whatsappLink(message);
    el.target = "_blank";
    el.rel = "noopener";
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Discovery Call Request — GetXH");
  });
})();

/* ---- Booking / video links ([data-booking], [data-loom], [data-loom-intro]) ---- */
(function wireLinks() {
  const isSet = (v) => v && !/^[A-Z0-9_]+$/.test(v); // still "BOOKING_URL" etc. = not filled in yet
  const external = (el, url) => { el.href = url; el.target = "_blank"; el.rel = "noopener"; };
  document.querySelectorAll("[data-booking]").forEach((el) => { if (isSet(CONFIG.bookingUrl)) external(el, CONFIG.bookingUrl); });
  document.querySelectorAll("[data-loom]").forEach((el) => { if (isSet(CONFIG.loomUrl)) external(el, CONFIG.loomUrl); });
  document.querySelectorAll("[data-loom-intro]").forEach((el) => {
    if (isSet(CONFIG.loomIntroUrl)) external(el, CONFIG.loomIntroUrl); else el.hidden = true;
  });
})();

/* ---- Navbar: scroll state + mobile menu ---- */
(function nav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = nav.querySelector(".nav__burger");
  if (!burger) return;

  const setMenuOpen = (open) => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", () => setMenuOpen(!nav.classList.contains("open")));
  nav.querySelectorAll(".nav__links a").forEach((link) =>
    link.addEventListener("click", () => setMenuOpen(false))
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenuOpen(false);
      burger.focus();
    }
  });
})();

/* ---- Scroll reveal (with stagger via data-delay) ---- */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
})();

/* ---- Prepare a contact message for WhatsApp ---- */
(function contactForm() {
  const form = document.getElementById("leadForm");
  if (!form) return;
  const phone = form.elements.phone;
  const link = document.getElementById("contactMessage");
  const status = document.getElementById("contactStatus");

  form.addEventListener("input", () => {
    phone.setCustomValidity("");
    link.hidden = true;
    link.removeAttribute("href");
    status.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const number = String(data.get("phone")).trim();
    const digits = number.replace(/\D/g, "");
    if (!/^\+?[\d(). -]+$/.test(number) || digits.length < 8 || digits.length > 15) {
      phone.setCustomValidity("Enter a phone number with 8 to 15 digits.");
      phone.reportValidity();
      return;
    }
    const details = [
      "Hi GetXH! I’d like to discuss automation.",
      "Name: " + String(data.get("name")).trim(),
      "Phone: " + number,
      "Business: " + data.get("business"),
      String(data.get("message")).trim(),
    ].filter(Boolean);
    link.href = whatsappLink(details.join("\n"));
    link.hidden = false;
    status.textContent = "Message ready. Open WhatsApp to review and send it.";
    link.focus();
  });
})();

/* ---- Footer year ---- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---- Interactive WhatsApp demo (branching, Maya @ Skyline) ---- */
(function demoChat() {
  const body = document.getElementById("demoBody");
  const optsBox = document.getElementById("demoOpts");
  if (!body || !optsBox) return;

  const intro =
    '<div class="wa__system">🔒 Messages are end-to-end encrypted</div><div class="bubble bubble--in" style="opacity:1;transform:none">Hi! I\'m Maya, the AI assistant at Skyline Properties 😊 Are you looking to <b>buy</b> or <b>rent</b>?<span class="meta">now</span></div>';
  const startOpts = [{ t: "Buy", r: "I want to buy" }, { t: "Rent", r: "Looking to rent" }];

  const steps = [
    { bot: "Great choice! 🏠 What's your budget range?", opts: [{ t: "Under ₹50L", r: "Under ₹50L" }, { t: "₹50L–1Cr", r: "₹50L to 1Cr" }, { t: "₹1Cr+", r: "Above ₹1Cr" }] },
    { bot: "Perfect. When are you planning to move in?", opts: [{ t: "This month", r: "This month" }, { t: "1–3 months", r: "In 1–3 months" }, { t: "Just exploring", r: "Just exploring" }] },
    { bot: "I have 3 great matches! 🎉 I've reserved a site visit for you this Saturday at 11 AM — shall I confirm?", opts: [{ t: "Yes, confirm ✅", r: "Yes, please confirm!" }] },
    { bot: null, tag: "Sample complete · Site visit confirmed", opts: [{ t: "↻ Restart demo", r: "__restart" }] },
  ];

  function addBubble(side, html) {
    const b = document.createElement("div");
    b.className = "bubble bubble--" + side;
    b.style.opacity = "1"; b.style.transform = "none";
    b.innerHTML = html + '<span class="meta">' + (side === "out" ? "now <i>✓✓</i>" : "now") + "</span>";
    body.appendChild(b); body.scrollTop = body.scrollHeight;
  }
  function addTyping() {
    const t = document.createElement("div");
    t.className = "typing"; t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t); body.scrollTop = body.scrollHeight; return t;
  }
  function setOpts(list) {
    optsBox.innerHTML = "";
    list.forEach((o) => { const b = document.createElement("button"); b.textContent = o.t; b.dataset.reply = o.r; optsBox.appendChild(b); });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let step = 0;
  let renting = false;
  optsBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const reply = btn.dataset.reply;
    if (reply === "__restart") { body.innerHTML = intro; setOpts(startOpts); step = 0; return; }
    if (!step) renting = reply === "Looking to rent";
    addBubble("out", reply);
    optsBox.innerHTML = "";
    const cur = renting && !step
      ? { bot: "What monthly rent are you comfortable with?", opts: [{ t: "Under ₹20,000", r: "Under ₹20,000 per month" }, { t: "₹20,000–35,000", r: "₹20,000 to ₹35,000 per month" }, { t: "₹35,000+", r: "Above ₹35,000 per month" }] }
      : steps[step];
    const t = addTyping();
    setTimeout(() => {
      t.remove();
      if (cur.bot) addBubble("in", cur.bot);
      if (cur.tag) { const d = document.createElement("div"); d.className = "bubble bubble--tag"; d.style.opacity = "1"; d.style.transform = "none"; d.textContent = cur.tag; body.appendChild(d); body.scrollTop = body.scrollHeight; }
      if (cur.opts) {
        setOpts(cur.opts);
        optsBox.querySelector("button")?.focus({ preventScroll: true });
      }
      step++;
    }, reduceMotion.matches ? 0 : 650);
  });
})();

/* ---- Vapi voice demo ("Talk to Demo AI" on Services) ---- */
(function vapiDemo() {
  const btn = document.getElementById("vapiDemoBtn");
  if (!btn) return;

  const label = btn.querySelector(".vapi-btn__label");
  const note = document.getElementById("vapiDemoNote");
  const setLabel = (t) => { if (label) label.textContent = t; };
  const setNote = (t) => { if (note) note.textContent = t; };

  // If keys aren't configured yet, leave a graceful, non-broken button.
  if (!CONFIG.vapiPublicKey || !CONFIG.vapiAssistantId) {
    btn.disabled = true;
    setNote("Live demo coming soon — meanwhile, book a free call to see it in action.");
    return;
  }

  let vapi = null;       // the Vapi SDK instance
  let sdkPromise = null; // cached loader so we only fetch the SDK once
  let active = false;    // is a call currently running

  // Lazy-load the Vapi Web SDK from CDN on first click.
  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = import("https://esm.sh/@vapi-ai/web@2.3.8")
      .then((mod) => (mod && mod.default) || mod)
      .catch((err) => { sdkPromise = null; throw err; });
    return sdkPromise;
  }

  function wireEvents() {
    vapi.on("call-start", () => {
      active = true;
      btn.disabled = false;
      btn.classList.remove("is-connecting");
      btn.classList.add("is-active");
      setLabel("End demo");
      setNote("You're live with the AI — ask it anything. Tap to end.");
    });
    vapi.on("call-end", () => {
      active = false;
      btn.disabled = false;
      btn.classList.remove("is-active", "is-connecting");
      setLabel("Talk to Demo AI");
      setNote("Thanks for trying it! Tap to talk again, or book a free call to get your own.");
    });
    vapi.on("error", (e) => {
      console.error("Vapi error:", e);
      active = false;
      btn.disabled = false;
      btn.classList.remove("is-active", "is-connecting");
      setLabel("Talk to Demo AI");
      setNote("Couldn't start the demo — check your mic permission and try again.");
    });
  }

  btn.addEventListener("click", async () => {
    // Stop an active call.
    if (active && vapi) { vapi.stop(); return; }

    btn.disabled = true;
    btn.classList.add("is-connecting");
    setLabel("Connecting…");
    setNote("Starting the demo — please allow microphone access.");
    try {
      const Vapi = await loadSdk();
      if (!vapi) { vapi = new Vapi(CONFIG.vapiPublicKey); wireEvents(); }
      await vapi.start(CONFIG.vapiAssistantId);
    } catch (err) {
      console.error("Vapi start failed:", err);
      btn.disabled = false;
      btn.classList.remove("is-connecting");
      setLabel("Talk to Demo AI");
      setNote("Couldn't load the demo right now. Please try again, or book a free call.");
    }
  });
})();
     
