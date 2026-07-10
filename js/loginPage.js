import { login } from "../services/userApi.js";
import { redirectIfLoggedIn } from "../utils/auth.js";
import { validateEmail, validatePassword } from "../utils/validation.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

redirectIfLoggedIn();

const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

const emailInput = loginForm.elements.email;
const passwordInput = loginForm.elements.password;

const emailHelper = document.querySelector("#emailHelper");
const passwordHelper = document.querySelector("#passwordHelper");
const submitButton = loginForm.querySelector('button[type="submit"]');

function saveLoginUser(data) {
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("nickname", data.nickname);
  localStorage.setItem("accessToken", data.token.accessToken);
  localStorage.setItem("refreshToken", data.token.refreshToken);

  if (data.profileImageUrl) {
    localStorage.setItem("profileImageUrl", data.profileImageUrl);
  } else {
    localStorage.removeItem("profileImageUrl");
  }
}

function updateLoginButtonState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const isValid =
    !validateEmail(email) &&
    !validatePassword(password);

  submitButton.disabled = !isValid;
}

function updateLoginFormState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  setHelper(emailHelper, email ? validateEmail(email) : "");
  setHelper(passwordHelper, password ? validatePassword(password) : "");

  loginMessage.textContent = "";
  updateLoginButtonState();
}

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.togglePassword}`);
    const isVisible = input.type === "text";

    input.type = isVisible ? "password" : "text";
    button.textContent = isVisible ? "보기" : "숨기기";
  });
});

emailInput.addEventListener("input", updateLoginFormState);
passwordInput.addEventListener("input", updateLoginFormState);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  clearHelpers(emailHelper, passwordHelper);
  loginMessage.textContent = "";

  const emailMessage = validateEmail(email);
  const passwordMessage = validatePassword(password);

  if (emailMessage) setHelper(emailHelper, emailMessage);
  if (passwordMessage) setHelper(passwordHelper, passwordMessage);

  if (emailMessage || passwordMessage) {
    return;
  }

  try {
    const result = await login({
      email,
      password,
    });

    saveLoginUser(result.data);
    window.location.href = "./postList.html";
  } catch (error) {
    loginMessage.textContent = "이메일 또는 비밀번호를 확인해주세요.";
  }
});

updateLoginButtonState();