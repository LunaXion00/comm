import { renderHeader } from "../components/header.js";
import { getPostDetail, modifyPost } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { setHelper, clearHelpers, setMessage } from "../utils/formHelper.js";

const accessToken = requireLogin();
renderHeader();

const modifyPostForm = document.querySelector("#modifyPostForm");
const titleInput = modifyPostForm.elements.title;
const postBodyInput = modifyPostForm.elements.postBody;
const postImageUrlInput = modifyPostForm.elements.postImageUrl;

const titleHelper = document.querySelector("#titleHelper");
const postBodyHelper = document.querySelector("#postBodyHelper");
const modifyMessage = document.querySelector("#modifyMessage");
const modifyStatusMessage = document.querySelector("#modifyStatusMessage");
const postDetailLink = document.querySelector("#postDetailLink");

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");
const nickname = localStorage.getItem("nickname");

if (!postId) {
  alert("게시글 ID가 없습니다.");
  window.location.href = "./postList.html";
}

if (postId) {
  postDetailLink.href = `./postDetail.html?postId=${postId}`;
}

function getPostFormValues() {
  return {
    title: titleInput.value.trim(),
    postBody: postBodyInput.value.trim(),
    postImageUrl: postImageUrlInput.value.trim() || null,
  };
}

function setPostFormValues(post) {
  titleInput.value = post.title || "";
  postBodyInput.value = post.postBody || "";
  postImageUrlInput.value = post.postImageUrl || "";
}

function setFormDisabled(disabled) {
  Array.from(modifyPostForm.elements).forEach((element) => {
    element.disabled = disabled;
  });
}

function validatePostRequiredFields() {
  const values = getPostFormValues();

  const titleMessage = values.title ? "" : "제목을 입력해주세요.";
  const postBodyMessage = values.postBody ? "" : "내용을 입력해주세요.";

  setHelper(titleHelper, titleMessage);
  setHelper(postBodyHelper, postBodyMessage);

  if (titleMessage) {
    titleInput.focus();
    return false;
  }

  if (postBodyMessage) {
    postBodyInput.focus();
    return false;
  }

  return true;
}

function clearPostHelpersWhenFilled() {
  const values = getPostFormValues();

  if (values.title) {
    setHelper(titleHelper, "");
  }

  if (values.postBody) {
    setHelper(postBodyHelper, "");
  }
}

async function loadPostForModify() {
  setFormDisabled(true);

  try {
    const result = await getPostDetail({
       
      postId,
    });

    const data = result.data || {};
    const author = data.author || {};
    const post = data.post || {};

    const isOwner = author.nickname === nickname;

    if (!isOwner) {
      alert("게시글 작성자만 수정할 수 있습니다.");
      window.location.href = `./postDetail.html?postId=${postId}`;
      return;
    }

    setPostFormValues(post);
    clearHelpers(titleHelper, postBodyHelper);
    setMessage(modifyMessage, "");
    setMessage(modifyStatusMessage, "게시글을 불러왔습니다. 수정 후 저장할 수 있습니다.", "success");
  } catch (error) {
    setMessage(modifyMessage, error.message, "error");
    setMessage(modifyStatusMessage, "게시글을 불러오지 못했습니다.", "error");
  } finally {
    setFormDisabled(false);
  }
}

titleInput.addEventListener("input", clearPostHelpersWhenFilled);
postBodyInput.addEventListener("input", clearPostHelpersWhenFilled);

modifyPostForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isValid = validatePostRequiredFields();

  if (!isValid) {
    return;
  }

  const values = getPostFormValues();

  setFormDisabled(true);
  setMessage(modifyMessage, "");
  setMessage(modifyStatusMessage, "수정 내용을 저장하는 중입니다.");

  try {
    await modifyPost({
       
      postId,
      ...values,
    });

    window.location.href = `./postDetail.html?postId=${postId}`;
  } catch (error) {
    setFormDisabled(false);
    setMessage(modifyMessage, error.message, "error");
    setMessage(modifyStatusMessage, "저장 중 문제가 발생했습니다.", "error");
  }
});

if (postId) {
  loadPostForModify();
}