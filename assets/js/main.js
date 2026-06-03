/* =========================================================
   GetXH Automation — shared site logic
   👉 EDIT YOUR CONTACT DETAILS HERE:
   ========================================================= */
const CONFIG = {
  whatsappNumber: "919999999999", // country code + number, no +, no spaces
  whatsappMessage: "Hi GetXH! I'd like to know how you can help me capture and convert more leads.",
  email: "sawaisinghbusiness@gmail.com",
};

/* ---- Wire up all WhatsApp links ([data-wa]) ---- */
(function wireWhatsApp() {
  const link =
    "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage);
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.href = link;
    el.target = "_blank";
    el.rel = "noopener";
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Discovery Call Request — GetXH");
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
  if (burger) burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
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

/* ---- Animated number counters ([data-count]) ---- */
(function counters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1400;
    const start = performance.now();
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
})();

/* ---- Self-typing WhatsApp chat (hero) — realistic conversation ---- */
(function chat() {
  const body = document.getElementById("waBody");
  if (!body) return;

  // out = the customer (right, green) · in = the AI assistant (left, white)
  const script = [
    { side: "sys", text: "🔒 Messages are end-to-end encrypted" },
    { side: "out", text: "Hello", time: "10:24" },
    { side: "in",  text: "Hello! 👋 Welcome to Skyline Properties. I'm Riya, your personal assistant. How may I help you today?", time: "10:24" },
    { side: "out", text: "I'm looking to buy a property in Sector 45, Gurgaon", time: "10:25" },
    { side: "in",  text: "Great choice! 🏠 We currently have 4 properties available in Sector 45. May I know your budget range?", time: "10:25" },
    { side: "out", text: "Around ₹85 lakhs", time: "10:26" },
    { side: "in",  text: "Perfect! I have a lovely 3BHK in Sector 45 for ₹82L — semi-furnished, just 5 mins from the metro. 🌇", time: "10:26" },
    { side: "in",  text: "Would you like to schedule a visit? What day & time suits you — and may I have your name, please?", time: "10:27" },
    { side: "out", text: "Rahul. Saturday 11 AM works for me", time: "10:28" },
    { side: "in",  text: "Done, Rahul! ✅ Your site visit is booked for Saturday at 11 AM, Sector 45. You'll get a reminder. See you there! 😊", time: "10:28" },
  ];

  const phone = document.querySelector(".hero__visual .phone");
  const success = document.getElementById("chatSuccess");

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const scroll = () => (body.scrollTop = body.scrollHeight);

  function addSystem(text) {
    const d = document.createElement("div");
    d.className = "wa__system";
    d.textContent = text;
    body.appendChild(d);
    scroll();
  }
  function addTyping() {
    const t = document.createElement("div");
    t.className = "typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t);
    scroll();
    return t;
  }
  function addBubble(side, text, time) {
    const b = document.createElement("div");
    b.className = "bubble bubble--" + side;
    b.appendChild(document.createTextNode(text));
    const m = document.createElement("span");
    m.className = "meta";
    m.innerHTML = time + (side === "out" ? " <i>✓✓</i>" : "");
    b.appendChild(m);
    body.appendChild(b);
    scroll();
  }

  async function play() {
    body.innerHTML = "";
    for (const msg of script) {
      if (msg.side === "sys") {
        addSystem(msg.text);
        await wait(700);
      } else if (msg.side === "in") {
        const t = addTyping();
        await wait(1000 + Math.min(msg.text.length * 13, 1600));
        t.remove();
        addBubble("in", msg.text, msg.time);
        await wait(500);
      } else {
        await wait(650);
        addBubble("out", msg.text, msg.time);
        await wait(450);
      }
    }
    // ---- finish sequence: phone rotates out → success reveals → success floats out → phone flips back ----
    await wait(1300);
    if (phone) phone.classList.add("phone--out");
    await wait(800);
    if (success) success.classList.add("show");
    await wait(3000);

    // success exits smoothly (float up + fade + blur)
    if (success) {
      success.classList.remove("show");
      success.classList.add("success--out");
    }
    await wait(380); // let the success start floating away, then bring phone back (overlap)

    if (phone) {
      phone.classList.remove("phone--out");
      phone.classList.add("phone--in");
    }
    await wait(300);
    if (success) success.classList.remove("success--out"); // reset success for next loop
    await wait(600);
    if (phone) phone.classList.remove("phone--in");

    await wait(400);
    play(); // loop
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(body);
})();

/* ---- Contact form (demo: opens WhatsApp/email with the message) ---- */
(function contactForm() {
  const form = document.getElementById("leadForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const phone = data.get("phone") || "";
    const business = data.get("business") || "";
    const message = data.get("message") || "";
    const text =
      `New enquiry from the website:%0A%0AName: ${name}%0APhone: ${phone}%0ABusiness: ${business}%0A%0A${message}`;
    const link = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + text;
    const note = document.getElementById("formNote");
    if (note) {
      note.textContent = "Opening WhatsApp to send your details… ✅";
      note.style.color = "var(--brand-dk)";
    }
    window.open(link, "_blank", "noopener");
    form.reset();
  });
})();

/* ---- Footer year ---- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
