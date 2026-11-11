document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".slide-dot"));
  const currentLabel = document.getElementById("currentSlide");
  const previous = document.getElementById("previousSlide");
  const next = document.getElementById("nextSlide");
  let current = 0;

  const showSlide = (index, updateHash = true) => {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle("is-current", active);
      if (active) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    currentLabel.textContent = String(current + 1).padStart(2, "0");
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    if (updateHash) history.replaceState(null, "", `#slide-${current + 1}`);
  };

  previous.addEventListener("click", () => showSlide(current - 1));
  next.addEventListener("click", () => showSlide(current + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.go))));
  document.getElementById("printDeck").addEventListener("click", () => window.print());

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      showSlide(current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      showSlide(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  const requestedSlide = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]);
  showSlide(Number.isInteger(requestedSlide) && requestedSlide > 0 ? requestedSlide - 1 : 0, false);
});
