const openMenuBtn = document.querySelector(".open-menu");
const closeMenuBtn = document.querySelector(".mob-close-btn");
const mobileMenu = document.querySelector(".mob-menu");
const openMenuIcon = openMenuBtn?.querySelector(".open-menu-icon use");
const navLinks = document.querySelectorAll(".header-menu-link, .mob-menu-link");
const sections = ["studio", "portfolio", "contacts"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
let manualSectionId = null;

const setMenuState = (isOpen) => {
  mobileMenu?.classList.toggle("is-open", isOpen);
  openMenuBtn?.classList.toggle("is-open", isOpen);
  openMenuBtn?.setAttribute("aria-expanded", String(isOpen));

  if (openMenuIcon) {
    const iconPath = isOpen
      ? "./images/icons.svg#icon-close-black-18dp-2-1"
      : "./images/icons.svg#icon-Group-1";

    openMenuIcon.setAttribute("href", iconPath);
    openMenuIcon.setAttribute("xlink:href", iconPath);
  }
};

const setActiveLink = (targetId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${targetId}`;
    link.classList.toggle("active", isActive);
    link.classList.toggle("current", isActive);
  });
};

const updateActiveLinkOnScroll = () => {
  if (manualSectionId) {
    setActiveLink(manualSectionId);
    return;
  }

  const scrollPosition = window.scrollY + 140;
  let currentSectionId = "studio";

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      currentSectionId = section.id;
    }
  });

  setActiveLink(currentSectionId);
};

const handleNavClick = (link) => {
  const href = link.getAttribute("href");

  if (!href?.startsWith("#")) {
    return;
  }

  const targetId = href.slice(1);

  manualSectionId = targetId;
  setActiveLink(targetId);
  scrollToSection(targetId);

  if (mobileMenu?.classList.contains("is-open")) {
    setMenuState(false);
  }
};

const scrollToSection = (targetId) => {
  const section = document.getElementById(targetId);

  if (!section) {
    return;
  }

  const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
  const top =
    section.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

  window.scrollTo({ top, behavior: "smooth" });
};

openMenuBtn?.addEventListener("click", () => {
  const isOpen = !mobileMenu?.classList.contains("is-open");
  setMenuState(isOpen);
});

closeMenuBtn?.addEventListener("click", () => {
  setMenuState(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    handleNavClick(link);
  });
});

window.addEventListener("scroll", updateActiveLinkOnScroll, { passive: true });
window.addEventListener("load", updateActiveLinkOnScroll);

setActiveLink("studio");
setMenuState(false);
