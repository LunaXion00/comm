import { modifyInfo, withdrawn } from "../services/userApi.js";
import { renderHeader } from "../components/header.js";
import { requireLogin } from "../utils/auth.js";
import { validateNickname } from "../utils/validation.js";
import { setHelper } from "../utils/formHelper.js";

renderHeader();

const modifyInfoForm = document.querySelector("#modifyInfoForm");
const nicknameInput = document.querySelector("#nickname");
const profileImageUrlInput = document.querySelector("#profileImageUrl");
const message = document.querySelector("#message");
const successPopup = document.querySelector("#successPopup");
const withdrawButton = document.querySelector("#withdrawButton");
const nicknameHelper = document.querySelector("#nicknameHelper");
const submitButton = modifyInfoForm.querySelector('button[type="submit"]');

const accessToken = requireLogin();
const userId = localStorage.getItem("userId");
const nickname = localStorage.getItem("nickname");
const profileImageUrl = localStorage.getItem("profileImageUrl");

nicknameInput.value = nickname || "";
profileImageUrlInput.value = profileImageUrl || "";

function updateModifyInfoButtonState() {
  const nickname = nicknameInput.value.trim();

  const isValid = !validateNickname(nickname);

  submitButton.disabled = !isValid;
}

nicknameInput.addEventListener("input", updateModifyInfoButtonState);

modifyInfoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newNickname = nicknameInput.value.trim();
  const newProfileImageUrl = profileImageUrlInput.value.trim();

  const nicknameMessage = validateNickname(newNickname);

  setHelper(nicknameHelper, nicknameMessage);

  if (nicknameMessage) {
    return;
  }

  try {
    const result = await modifyInfo({
      userId,
      accessToken,
      nickname: newNickname,
      profileImageUrl: newProfileImageUrl,
    });

    localStorage.setItem("nickname", newNickname);
    localStorage.setItem("profileImageUrl", newProfileImageUrl);

    successPopup.hidden = false;

    setTimeout(() => {
      successPopup.hidden = true;
    }, 1200);
  } catch (error) {
    if (error.status === 409 || error.message.includes("409")) {
      setHelper(nicknameHelper, "중복된 닉네임입니다");
      return;
    }
    message.textContent = error.message;
  }
});

withdrawButton.addEventListener("click", async()=>{
    const confirmed = confirm("회원탈퇴 하시겠습니까?");
    if(!confirmed) return;

    try{
        const result = await withdrawn({
            userId, 
            accessToken,
        });
        alert(result.message);
        localStorage.clear();
        window.location.href = "./login.html";
    } catch(error){
        message.textContent = error.message;
    }
});

updateModifyInfoButtonState();
