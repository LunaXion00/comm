import { modifyPassword } from "../services/userApi.js";
import { renderHeader } from "../components/header.js";
import { requireLogin } from "../utils/auth.js";
import { validatePassword, validatePasswordConfirm } from "../utils/validation.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

const modifyPwForm = document.querySelector("#modifyPwForm");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");
const passwordHelper = document.querySelector("#passwordHelper");
const passwordConfirmHelper = document.querySelector("#passwordConfirmHelper");
const submitButton = modifyPwForm.querySelector('button[type="submit"]');

const message = document.querySelector("#message");
const successPopup = document.querySelector("#successPopup");

const accessToken = requireLogin();
const userId = localStorage.getItem("userId");

passwordInput.value = "";
passwordConfirmInput.value = "";

function updatePasswordButtonState() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  const isValid =
    !validatePassword(password) &&
    !validatePasswordConfirm(password, passwordConfirm);

  submitButton.disabled = !isValid;
}

passwordInput.addEventListener("input", updatePasswordButtonState);
passwordConfirmInput.addEventListener("input", updatePasswordButtonState);

modifyPwForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const newPassword = passwordInput.value;
  const newPasswordConfirm = passwordConfirmInput.value;

  clearHelpers(
    emailHelper,
    passwordHelper,
    passwordConfirmHelper,
    nicknameHelper
  );
  signupMessage.textContent = "";

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
    const result = await modifyPassword({
      userId,
      accessToken,
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    });

    successPopup.hidden = false;

    setTimeout(() => {
      successPopup.hidden = true;
    }, 1200);
  } catch (error) {
    message.textContent = error.message;
  }
});

renderHeader();
updatePasswordButtonState();