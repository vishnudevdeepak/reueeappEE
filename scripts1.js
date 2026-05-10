const navItems = document.querySelectorAll(".nav-item");
const slider = document.querySelector(".nav-slider");

function moveSlider(el) {
  const rect = el.getBoundingClientRect();
  const parentRect = el.parentElement.getBoundingClientRect();

  slider.style.width = rect.width + "px";
  slider.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

/* INIT (on page load) */
window.onload = () => {
  const active = document.querySelector(".nav-item.active");
  if (active) moveSlider(active);
};

/* HOVER EFFECT */
navItems.forEach(item => {
  item.addEventListener("mouseenter", () => moveSlider(item));

  item.addEventListener("click", () => {
    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

/* RESET TO ACTIVE ON LEAVE */
document.getElementById("navLinks").addEventListener("mouseleave", () => {
  const active = document.querySelector(".nav-item.active");
  if (active) moveSlider(active);
});
