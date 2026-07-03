import { signup } from "../services/userApi.js";
import { validateEmail, validateNickname, validatePassword, validatePasswordConfirm } from "../utils/validation.js";
import { setHelper, clearHelpers, setMessage } from "../utils/formHelper.js";

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

emailInput.addEventListener("input", updateSignupButtonState);
passwordInput.addEventListener("input", updateSignupButtonState);
passwordConfirmInput.addEventListener("input", updateSignupButtonState);
nicknameInput.addEventListener("input", updateSignupButtonState);

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearHelpers(emailHelper, passwordHelper, passwordConfirmHelper, nicknameHelper);
  signupMessage.textContent = "";
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();
  const profileImageUrl = profileImageUrlInput.value.trim();

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
    const result = await signup({
      email: email,
      password: password,
      passwordConfirm: passwordConfirm,
      nickname: nickname,
      profileImageUrl: profileImageUrl
    });
    signupForm.reset();
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

updateSignupButtonState();