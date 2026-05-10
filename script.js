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
const items = document.querySelectorAll(".nav-item");
const underline = document.querySelector(".nav-underline");

let lastX = 0;

/* MOVE UNDERLINE */
function moveUnderline(el) {
  const rect = el.getBoundingClientRect();
  const parent = el.parentElement.getBoundingClientRect();

  const newX = rect.left - parent.left;
  const newWidth = rect.width;

  // Stretch effect
  const distance = Math.abs(newX - lastX);
  underline.style.width = newWidth + distance * 0.3 + "px";

  requestAnimationFrame(() => {
    underline.style.transform = `translateX(${newX}px)`;
    underline.style.width = newWidth + "px";
  });

  lastX = newX;
}

/* INIT */
window.onload = () => {
  const active = document.querySelector(".nav-item.active");
  if (active) moveUnderline(active);
};

/* HOVER + CLICK */
items.forEach(item => {
  item.addEventListener("mouseenter", () => moveUnderline(item));

  item.addEventListener("click", () => {
    items.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

/* RETURN TO ACTIVE */
document.getElementById("navLinks").addEventListener("mouseleave", () => {
  const active = document.querySelector(".nav-item.active");
  if (active) moveUnderline(active);
});