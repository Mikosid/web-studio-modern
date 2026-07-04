const subscribeForm = document.querySelector("#subscribe-form");

if (subscribeForm) {
  subscribeForm.addEventListener("submit", handleSubscribe);
}

async function handleSubscribe(event) {
  event.preventDefault();

  const button = subscribeForm.querySelector("button");
  const input = subscribeForm.querySelector("input");

  const email = input.value.trim();

  button.disabled = true;
  button.textContent = "Subscribing...";

  try {
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Упс, щось пішло не так");
    }

    showToast("🎉 Thank you for subscribing!", "success");

    subscribeForm.reset();
  } catch (error) {
    showToast(error.message || "Сервер не відповідає", "error");
  } finally {
    button.disabled = false;
    button.innerHTML = `
      Subscribe
      <svg class="footer-btn-icon" width="24" height="24">
          <use href="./images/icons.svg#icon-icon-send"></use>
      </svg>
    `;
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
