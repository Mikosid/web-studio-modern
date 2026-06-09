const openModalBtn = document.querySelector(".main-business-btn");
const closeModalBtn = document.querySelector(".modal-close-btn");
const backdrop = document.querySelector(".backdrop");

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", onBackdropClick);

document.addEventListener("keydown", onEscPress);

function openModal() {
  backdrop.classList.add("is-open");
}

function closeModal() {
  backdrop.classList.remove("is-open");
}

function onBackdropClick(event) {
  if (event.target === backdrop) {
    closeModal();
  }
}

function onEscPress(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}
