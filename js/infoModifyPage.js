import { modifyInfo, withdrawn } from "../services/userApi.js";
import { renderHeader } from "../components/header.js";
import { requireLogin } from "../utils/auth.js";
import { validateNickname } from "../utils/validation.js";
import { setHelper } from "../utils/formHelper.js";

const accessToken = requireLogin();
renderHeader();

const DEFAULT_PROFILE_IMAGE_URL = "./assets/default-profile.png";

const modifyInfoForm = document.querySelector("#modifyInfoForm");
const nicknameInput = document.querySelector("#nickname");
const profileImageUrlInput = document.querySelector("#profileImageUrl");
const profilePreviewImage = document.querySelector("#profilePreviewImage");
const clearProfileImageButton = document.querySelector("#clearProfileImageButton");
const message = document.querySelector("#message");
const successPopup = document.querySelector("#successPopup");
const withdrawButton = document.querySelector("#withdrawButton");
const nicknameHelper = document.querySelector("#nicknameHelper");
const submitButton = modifyInfoForm.querySelector('button[type="submit"]');

const userId = localStorage.getItem("userId");
const savedNickname = localStorage.getItem("nickname");
const savedProfileImageUrl = localStorage.getItem("profileImageUrl");

nicknameInput.value = savedNickname || "";
profileImageUrlInput.value =
  savedProfileImageUrl && savedProfileImageUrl !== "null"
    ? savedProfileImageUrl
    : "";

function updateProfilePreview() {
  const profileImageUrl = profileImageUrlInput.value.trim();

  profilePreviewImage.src = profileImageUrl || DEFAULT_PROFILE_IMAGE_URL;
}

function updateModifyInfoButtonState() {
  const nickname = nicknameInput.value.trim();
  const nicknameMessage = validateNickname(nickname);

  submitButton.disabled = Boolean(nicknameMessage);
}

function updateHeaderProfileImage(profileImageUrl) {
  const profileMenuButton = document.querySelector("#profileMenuButton");

  if (!profileMenuButton) return;

  profileMenuButton.textContent = "";

  if (profileImageUrl) {
    const image = document.createElement("img");
    image.src = profileImageUrl;
    image.alt = "프로필 이미지";
    profileMenuButton.appendChild(image);
    return;
  }

  const placeholder = document.createElement("span");
  placeholder.className = "profile-placeholder";
  profileMenuButton.appendChild(placeholder);
}

nicknameInput.addEventListener("input", () => {
  setHelper(nicknameHelper, validateNickname(nicknameInput.value.trim()));
  updateModifyInfoButtonState();
});

profileImageUrlInput.addEventListener("input", updateProfilePreview);

profilePreviewImage.addEventListener("error", () => {
  if (!profilePreviewImage.src.includes("default-profile.png")) {
    profilePreviewImage.src = DEFAULT_PROFILE_IMAGE_URL;
  }
});

clearProfileImageButton.addEventListener("click", () => {
  profileImageUrlInput.value = "";
  updateProfilePreview();
});

modifyInfoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newNickname = nicknameInput.value.trim();
  const newProfileImageUrl = profileImageUrlInput.value.trim() || null;

  const nicknameMessage = validateNickname(newNickname);

  setHelper(nicknameHelper, nicknameMessage);
  message.textContent = "";

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

    const updatedNickname = result.data?.nickname ?? newNickname;
    const updatedProfileImageUrl = result.data?.profileImageUrl ?? newProfileImageUrl;

    localStorage.setItem("nickname", updatedNickname);

    if (updatedProfileImageUrl) {
      localStorage.setItem("profileImageUrl", updatedProfileImageUrl);
    } else {
      localStorage.removeItem("profileImageUrl");
    }

    nicknameInput.value = updatedNickname;
    profileImageUrlInput.value = updatedProfileImageUrl || "";

    updateProfilePreview();
    updateHeaderProfileImage(updatedProfileImageUrl);

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

withdrawButton.addEventListener("click", async () => {
  const confirmed = confirm("회원탈퇴 하시겠습니까?");

  if (!confirmed) return;

  try {
    const result = await withdrawn({
      userId,
      accessToken,
    });

    alert(result.message);
    localStorage.clear();
    window.location.href = "./login.html";
  } catch (error) {
    message.textContent = error.message;
  }
});

updateProfilePreview();
updateModifyInfoButtonState();