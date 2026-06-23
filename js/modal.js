const openModalBtn = document.querySelector(".main-business-btn");
const closeModalBtn = document.querySelector(".modal-close-btn");
const backdrop = document.querySelector(".backdrop");
const modalForm = document.querySelector(".modal-form");
const modalSubmitBtn = document.querySelector(".modal-btn");
const modalMessage = document.querySelector(".modal-message");

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", onBackdropClick);
modalForm.addEventListener("submit", onModalFormSubmit);

document.addEventListener("keydown", onEscPress);

function openModal() {
  backdrop.classList.add("is-open");
  setModalMessage("");
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

async function onModalFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(modalForm);
  const payload = {
    name: formData.get("user-name"),
    phone: formData.get("user-phone"),
    email: formData.get("user-email"),
    comment: formData.get("user-comment"),
    privacyAccepted: formData.get("user-privacy") === "true",
  };

  setSubmitState(true);
  setModalMessage("Sending your request...", "info");

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.join(" ") || result.message || "Request failed.",
      );
    }

    modalForm.reset();
    setModalMessage(
      result.telegramSent
        ? "Thank you! Your request was saved and sent to Telegram."
        : "Thank you! Your request was saved. Telegram notification needs server setup.",
      "success",
    );
  } catch (error) {
    setModalMessage(
      error.message || "Something went wrong. Please try again.",
      "error",
    );
  } finally {
    setSubmitState(false);
  }
}

function setSubmitState(isSubmitting) {
  modalSubmitBtn.disabled = isSubmitting;
  modalSubmitBtn.textContent = isSubmitting ? "Sending..." : "Send";
}

function setModalMessage(message, type = "") {
  modalMessage.textContent = message;
  modalMessage.className = `modal-message${type ? ` modal-message-${type}` : ""}`;
}
