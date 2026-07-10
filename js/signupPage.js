import { signup } from "../services/userApi.js";
import { redirectIfLoggedIn } from "../utils/auth.js";
import { validateEmail, validateNickname, validatePassword, validatePasswordConfirm } from "../utils/validation.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

redirectIfLoggedIn();

const DEFAULT_PROFILE_IMAGE_URL = "./assets/default-profile.png";

const signupForm = document.querySelector("#signupForm");
const signupMessage = document.querySelector("#signupMessage");

const emailInput = signupForm.elements.email;
const passwordInput = signupForm.elements.password;
const passwordConfirmInput = signupForm.elements.passwordConfirm;
const nicknameInput = signupForm.elements.nickname;
const profileImageUrlInput = signupForm.elements.profileImageUrl;

const emailHelper = document.querySelector("#emailHelper");
const passwordHelper = document.querySelector("#passwordHelper");
const passwordConfirmHelper = document.querySelector("#passwordConfirmHelper");
const nicknameHelper = document.querySelector("#nicknameHelper");
const submitButton = signupForm.querySelector('button[type="submit"]');

const profilePreviewImage = document.querySelector("#signupProfilePreviewImage");

const passwordLengthRule = document.querySelector("#signupPasswordLengthRule");
const passwordUpperRule = document.querySelector("#signupPasswordUpperRule");
const passwordLowerRule = document.querySelector("#signupPasswordLowerRule");
const passwordNumberRule = document.querySelector("#signupPasswordNumberRule");
const passwordSpecialRule = document.querySelector("#signupPasswordSpecialRule");
const passwordConfirmRule = document.querySelector("#signupPasswordConfirmRule");

function setRuleState(element, isValid) {
  element.classList.toggle("is-valid", isValid);
}

function updateProfilePreview() {
  const profileImageUrl = profileImageUrlInput.value.trim();
  profilePreviewImage.src = profileImageUrl || DEFAULT_PROFILE_IMAGE_URL;
}

function updatePasswordRules() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  setRuleState(passwordLengthRule, password.length >= 8 && password.length <= 20);
  setRuleState(passwordUpperRule, /[A-Z]/.test(password));
  setRuleState(passwordLowerRule, /[a-z]/.test(password));
  setRuleState(passwordNumberRule, /[0-9]/.test(password));
  setRuleState(passwordSpecialRule, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password));
  setRuleState(passwordConfirmRule, Boolean(passwordConfirm) && password === passwordConfirm);
}

function updateSignupButtonState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();

  const isValid =
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validatePasswordConfirm(password, passwordConfirm) &&
    !validateNickname(nickname);

  submitButton.disabled = !isValid;
}

function updateSignupFormState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();

  setHelper(emailHelper, email ? validateEmail(email) : "");
  setHelper(passwordHelper, password ? validatePassword(password) : "");
  setHelper(
    passwordConfirmHelper,
    passwordConfirm ? validatePasswordConfirm(password, passwordConfirm) : ""
  );
  setHelper(nicknameHelper, nickname ? validateNickname(nickname) : "");

  signupMessage.textContent = "";

  updatePasswordRules();
  updateProfilePreview();
  updateSignupButtonState();
}

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.togglePassword}`);
    const isVisible = input.type === "text";

    input.type = isVisible ? "password" : "text";
    button.textContent = isVisible ? "보기" : "숨기기";
  });
});

profilePreviewImage.addEventListener("error", () => {
  if (!profilePreviewImage.src.includes("default-profile.png")) {
    profilePreviewImage.src = DEFAULT_PROFILE_IMAGE_URL;
  }
});

emailInput.addEventListener("input", updateSignupFormState);
passwordInput.addEventListener("input", updateSignupFormState);
passwordConfirmInput.addEventListener("input", updateSignupFormState);
nicknameInput.addEventListener("input", updateSignupFormState);
profileImageUrlInput.addEventListener("input", updateSignupFormState);

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearHelpers(emailHelper, passwordHelper, passwordConfirmHelper, nicknameHelper);
  signupMessage.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();
  const profileImageUrl = profileImageUrlInput.value.trim() || null;

  const emailMessage = validateEmail(email);
  const passwordMessage = validatePassword(password);
  const passwordConfirmMessage = validatePasswordConfirm(password, passwordConfirm);
  const nicknameMessage = validateNickname(nickname);

  if (emailMessage) setHelper(emailHelper, emailMessage);
  if (passwordMessage) setHelper(passwordHelper, passwordMessage);
  if (passwordConfirmMessage) setHelper(passwordConfirmHelper, passwordConfirmMessage);
  if (nicknameMessage) setHelper(nicknameHelper, nicknameMessage);

  if (emailMessage || passwordMessage || passwordConfirmMessage || nicknameMessage) {
    return;
  }

  try {
    await signup({
      email,
      password,
      passwordConfirm,
      nickname,
      profileImageUrl,
    });

    window.location.href = "./login.html";
  } catch (error) {
    if (error.status === 409) {
      setHelper(emailHelper, "이메일 또는 닉네임 중 중복되는 값이 있습니다.");
      setHelper(nicknameHelper, "이메일 또는 닉네임 중 중복되는 값이 있습니다.");
      return;
    }

    signupMessage.textContent = error.message;
  }
});

updateSignupFormState();