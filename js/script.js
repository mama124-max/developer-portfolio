/* ==========================================================
   Portfolio — interactions & contact form validation
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // ----- Footer year -----
  document.getElementById("year").textContent = new Date().getFullYear();

  // ----- Navbar background on scroll -----
  const nav = document.getElementById("mainNav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ----- Close mobile menu after clicking a link -----
  const navCollapse = document.getElementById("navLinks");
  navCollapse.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navCollapse.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  // ----- Reveal on scroll -----
  const revealEls = document.querySelectorAll(".reveal, .team-card, .skill-card, .project-card");
  revealEls.forEach((el) => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // ==========================================================
  // GitHub integration — set your GitHub username or organisation
  // below and the latest public repositories load automatically.
  // ==========================================================
  const GITHUB_USERNAME = "mama124-max";

  const ghRepos = document.getElementById("ghRepos");
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  if (ghRepos && GITHUB_USERNAME && GITHUB_USERNAME !== "your-username") {
    const user = encodeURIComponent(GITHUB_USERNAME);
    Promise.all([
      fetch(`https://api.github.com/users/${user}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=6`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ])
      .then(([profile, repos]) => {
        const head = document.querySelector(".gh-head");
        head.querySelector("i")?.remove();
        head.insertAdjacentHTML("afterbegin", `<img src="${esc(profile.avatar_url)}" alt="${esc(profile.login)} GitHub avatar" />`);
        document.getElementById("ghName").textContent = profile.name || profile.login;
        const link = document.getElementById("ghLink");
        link.href = profile.html_url;
        link.textContent = `github.com/${profile.login} · ${profile.public_repos} repos`;
        if (repos.length) {
          ghRepos.innerHTML = repos
            .map((r) => `<li><a href="${esc(r.html_url)}" target="_blank" rel="noopener"><i class="bi bi-journal-code"></i> ${esc(r.name)} <span>${esc(r.language || "Code")} · ★ ${r.stargazers_count}</span></a></li>`)
            .join("");
        }
      })
      .catch(() => {
        /* Keep the static repository list if GitHub can't be reached. */
      });
  }

  // ==========================================================
  // Contact form validation
  // ==========================================================
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const message = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const RECIPIENT = "mama.ceesay@example.com"; // team inbox

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NAME_RE = /^[\p{L}\s'.-]+$/u;

  const rules = {
    name: (v) => {
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Name must be at least 2 characters.";
      if (v.length > 100) return "Name must be under 100 characters.";
      if (!NAME_RE.test(v)) return "Name can only contain letters, spaces, apostrophes and hyphens.";
      return "";
    },
    email: (v) => {
      if (!v) return "Please enter your email address.";
      if (v.length > 255) return "Email must be under 255 characters.";
      if (!EMAIL_RE.test(v)) return "Please enter a valid email (e.g. you@example.com).";
      return "";
    },
    subject: (v) => {
      if (!v) return "Please add a subject.";
      if (v.length < 3) return "Subject must be at least 3 characters.";
      if (v.length > 120) return "Subject must be under 120 characters.";
      return "";
    },
    message: (v) => {
      if (!v) return "Please write a message.";
      if (v.length < 10) return "Message must be at least 10 characters.";
      if (v.length > 1000) return "Message must be under 1000 characters.";
      return "";
    },
  };

  const showError = (field, msg) => {
    const input = form.elements[field];
    const feedback = form.querySelector(`.invalid-feedback[data-for="${field}"]`);
    input.classList.toggle("is-invalid", Boolean(msg));
    input.classList.toggle("is-valid", !msg && input.value.trim() !== "");
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    feedback.textContent = msg;
  };

  const validateField = (field) => {
    const msg = rules[field](form.elements[field].value.trim());
    showError(field, msg);
    return !msg;
  };

  // Live validation once a field has been touched
  Object.keys(rules).forEach((field) => {
    const input = form.elements[field];
    input.addEventListener("blur", () => validateField(field));
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid") || input.classList.contains("is-valid")) validateField(field);
    });
  });

  message.addEventListener("input", () => {
    charCount.textContent = message.value.length;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerHTML = "";

    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      status.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-circle me-2"></i>Please fix the highlighted fields.</div>';
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      message: form.elements.message.value.trim(),
    };

    // No server: open the visitor's email app with the message pre-filled.
    const body = `${data.message}\n\n— ${data.name} (${data.email})`;
    const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;

    const safeName = data.name.replace(/[<>&"']/g, "");
    status.innerHTML = `<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Thanks, ${safeName}! Your message is ready — your email app should open to send it.</div>`;
    window.location.href = mailto;

    form.reset();
    charCount.textContent = "0";
    form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
  });
});
