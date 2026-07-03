import { login } from "../services/userApi.js";
import { redirectIfLoggedIn } from "../utils/auth.js";
import { validateEmail, validatePassword } from "../utils/validation.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

// 만약 로그인 되어있는 유저라면, 로그인 화면이 아니라 다른 화면(게시글 페이지 등 기본 설정)으로 이동. => 공통 함수로 변경.
// const accessToken = localStorage.getItem("accessToken");
// if(accessToken) window.location.href = "./index.html";
redirectIfLoggedIn();
 
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

const emailInput = loginForm.elements.email;
const passwordInput = loginForm.elements.password;

const emailHelper = document.querySelector("#emailHelper");
const passwordHelper = document.querySelector("#passwordHelper");
const submitButton = loginForm.querySelector('button[type="submit"]');

emailInput.addEventListener("input", updateLoginButtonState);
passwordInput.addEventListener("input", updateLoginButtonState);

function updateLoginButtonState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const isValid =
    !validateEmail(email) &&
    !validatePassword(password);

  submitButton.disabled = !isValid;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  clearHelpers(emailHelper, passwordHelper);

  const emailMessage = validateEmail(email);
  const passwordMessage = validatePassword(password);

  if (emailMessage) {
    setHelper(emailHelper, emailMessage);
  }

  if (passwordMessage) {
    setHelper(passwordHelper, passwordMessage);
  }

  if (emailMessage || passwordMessage) {
    return;
  }

  try {
    const result = await login({
      email, password
    });
    localStorage.setItem("userId", result.data.userId);
    localStorage.setItem("nickname", result.data.nickname);
    localStorage.setItem("accessToken", result.data.token.accessToken);
    localStorage.setItem("refreshToken", result.data.token.refreshToken);
    localStorage.setItem("profileImageUrl", result.data.profileImageUrl);

    window.location.href = "./postList.html";
  } catch (error) {

    loginMessage.textContent = "아이디 또는 비밀번호를 확인해주세요.";
  }
});

updateLoginButtonState();