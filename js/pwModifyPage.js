import { modifyPassword } from "../services/userApi.js";
import { renderHeader } from "../components/header.js";
import { requireLogin } from "../utils/auth.js";
import { validatePassword, validatePasswordConfirm } from "../utils/validation.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

const accessToken = requireLogin();
renderHeader();

const modifyPwForm = document.querySelector("#modifyPwForm");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");
const passwordHelper = document.querySelector("#passwordHelper");
const passwordConfirmHelper = document.querySelector("#passwordConfirmHelper");
const submitButton = modifyPwForm.querySelector('button[type="submit"]');

const message = document.querySelector("#message");
const successPopup = document.querySelector("#successPopup");

const passwordLengthRule = document.querySelector("#passwordLengthRule");
const passwordUpperRule = document.querySelector("#passwordUpperRule");
const passwordLowerRule = document.querySelector("#passwordLowerRule");
const passwordNumberRule = document.querySelector("#passwordNumberRule");
const passwordSpecialRule = document.querySelector("#passwordSpecialRule");
const passwordConfirmRule = document.querySelector("#passwordConfirmRule");

const userId = localStorage.getItem("userId");

passwordInput.value = "";
passwordConfirmInput.value = "";

function setRuleState(element, isValid) {
  element.classList.toggle("is-valid", isValid);
}

function updatePasswordRules() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  setRuleState(passwordLengthRule, password.length >= 8 && password.length <= 20);
  setRuleState(passwordUpperRule, /[A-Z]/.test(password));
  setRuleState(passwordLowerRule, /[a-z]/.test(password));
  setRuleState(passwordNumberRule, /[0-9]/.test(password));
  setRuleState(passwordSpecialRule, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password));
  setRuleState(
    passwordConfirmRule,
    Boolean(passwordConfirm) && password === passwordConfirm
  );
}

function updatePasswordButtonState() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  const isValid =
    !validatePassword(password) &&
    !validatePasswordConfirm(password, passwordConfirm);

  submitButton.disabled = !isValid;
}

function updatePasswordFormState() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  updatePasswordRules();
  updatePasswordButtonState();

  if (password) {
    setHelper(passwordHelper, validatePassword(password));
  } else {
    setHelper(passwordHelper, "");
  }

  if (passwordConfirm) {
    setHelper(passwordConfirmHelper, validatePasswordConfirm(password, passwordConfirm));
  } else {
    setHelper(passwordConfirmHelper, "");
  }

  message.textContent = "";
}

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.dataset.togglePassword;
    const input = document.querySelector(`#${inputId}`);

    const isPasswordVisible = input.type === "text";

    input.type = isPasswordVisible ? "password" : "text";
    button.textContent = isPasswordVisible ? "보기" : "숨기기";
  });
});

passwordInput.addEventListener("input", updatePasswordFormState);
passwordConfirmInput.addEventListener("input", updatePasswordFormState);

modifyPwForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPassword = passwordInput.value;
  const newPasswordConfirm = passwordConfirmInput.value;

  clearHelpers(passwordHelper, passwordConfirmHelper);
  message.textContent = "";

  const passwordMessage = validatePassword(newPassword);
  const passwordConfirmMessage = validatePasswordConfirm(
    newPassword,
    newPasswordConfirm
  );

  if (passwordMessage) {
    setHelper(passwordHelper, passwordMessage);
  }

  if (passwordConfirmMessage) {
    setHelper(passwordConfirmHelper, passwordConfirmMessage);
  }

  if (passwordMessage || passwordConfirmMessage) {
    return;
  }

  try {
    await modifyPassword({
      userId,
      accessToken,
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    });

    passwordInput.value = "";
    passwordConfirmInput.value = "";

    updatePasswordFormState();

    successPopup.hidden = false;

    setTimeout(() => {
      successPopup.hidden = true;
    }, 1200);
  } catch (error) {
    if (error.status === 400) {
      message.textContent = "비밀번호 조건을 다시 확인해주세요. 기존 비밀번호와 같은 값은 사용할 수 없습니다.";
      return;
    }

    message.textContent = error.message;
  }
});

updatePasswordFormState();