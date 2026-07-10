import { renderHeader } from "../components/header.js";
import { getCurrentDraft, saveDraft, updateDraft, publishDraft, deleteDraft } from "../services/draftApi.js";
import { postUpload } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { formatDateTime } from "../utils/format.js";
import { setHelper, clearHelpers } from "../utils/formHelper.js";

const accessToken = requireLogin();
renderHeader();

const HANDLED_DRAFT_KEY = "postCreateHandledDraftKey";

const uploadForm = document.querySelector("#uploadForm");
const uploadMessage = document.querySelector("#uploadMessage");
const draftMessage = document.querySelector("#draftMessage");

const saveDraftButton = document.querySelector("#saveDraftButton");
const deleteDraftButton = document.querySelector("#deleteDraftButton");

const titleInput = uploadForm.elements.title;
const postBodyInput = uploadForm.elements.postBody;
const postImageUrlInput = uploadForm.elements.postImageUrl;

const titleHelper = document.querySelector("#titleHelper");
const postBodyHelper = document.querySelector("#postBodyHelper");

const draftLoadModal = document.querySelector("#draftLoadModal");
const draftUpdatedAtText = document.querySelector("#draftUpdatedAtText");
const loadDraftButton = document.querySelector("#loadDraftButton");
const cancelDraftLoadButton = document.querySelector("#cancelDraftLoadButton");

const draftState = {
  exists: false,
  loaded: false,
  version: 0,
  pendingDraft: null,
};

function getPostFormValues() {
  return {
    title: titleInput.value.trim(),
    postBody: postBodyInput.value.trim(),
    postImageUrl: postImageUrlInput.value.trim() || null,
  };
}

function setPostFormValues(draft) {
  titleInput.value = draft.title || "";
  postBodyInput.value = draft.postBody || "";
  postImageUrlInput.value = draft.postImageUrl || "";
}

function setMessage(element, message, type = "") {
  element.textContent = message;
  element.className = type ? `message ${type}` : "message";
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

function getDraftKey(draft) {
  if (!draft) return "";

  return `${draft.draftId}:${draft.updatedAt || "no-updated-at"}:${draft.version}`;
}

function rememberHandledDraft(draft) {
  const draftKey = getDraftKey(draft);

  if (!draftKey) return;

  sessionStorage.setItem(HANDLED_DRAFT_KEY, draftKey);
}

function forgetHandledDraft() {
  sessionStorage.removeItem(HANDLED_DRAFT_KEY);
}

function wasDraftHandled(draft) {
  const draftKey = getDraftKey(draft);

  return Boolean(draftKey) && sessionStorage.getItem(HANDLED_DRAFT_KEY) === draftKey;
}

function showDraftLoadModal(draft) {
  draftUpdatedAtText.textContent = formatDateTime(draft.updatedAt) || "최근";
  draftLoadModal.hidden = false;
  loadDraftButton.focus();
}

function closeDraftLoadModal() {
  draftLoadModal.hidden = true;
}

function applyDraftToForm(draft) {
  setPostFormValues(draft);
  rememberHandledDraft(draft);

  draftState.exists = true;
  draftState.loaded = true;
  draftState.version = draft.version;
  draftState.pendingDraft = null;

  clearHelpers(titleHelper, postBodyHelper);
  setMessage(uploadMessage, "");

  deleteDraftButton.hidden = false;
  closeDraftLoadModal();

  setMessage(draftMessage, "임시저장된 글을 불러왔습니다.", "success");
}

async function loadCurrentDraft() {
  try {
    const result = await getCurrentDraft();

    if (!result || !result.data) {
      return;
    }

    const draft = result.data;

    draftState.exists = true;
    draftState.loaded = false;
    draftState.version = draft.version;
    draftState.pendingDraft = draft;

    deleteDraftButton.hidden = false;

    if (wasDraftHandled(draft)) {
      draftState.pendingDraft = null;
      setMessage(
        draftMessage,
        "임시저장 글이 있습니다. 현재 내용으로 임시저장하면 기존 글을 덮어씁니다."
      );
      return;
    }

    setMessage(draftMessage, "임시저장 글이 있습니다.", "success");
    showDraftLoadModal(draft);
  } catch (error) {
    setMessage(draftMessage, error.message, "error");
  }
}

function cancelDraftLoad() {
  if (draftState.pendingDraft) {
    rememberHandledDraft(draftState.pendingDraft);
  }

  draftState.pendingDraft = null;
  draftState.loaded = false;

  closeDraftLoadModal();

  setMessage(
    draftMessage,
    "임시저장 글을 불러오지 않았습니다. 임시저장을 누르면 현재 내용으로 덮어씁니다."
  );
}

titleInput.addEventListener("input", clearPostHelpersWhenFilled);
postBodyInput.addEventListener("input", clearPostHelpersWhenFilled);

loadDraftButton.addEventListener("click", () => {
  if (!draftState.pendingDraft) return;

  applyDraftToForm(draftState.pendingDraft);
});

cancelDraftLoadButton.addEventListener("click", cancelDraftLoad);

draftLoadModal.addEventListener("click", (event) => {
  if (event.target === draftLoadModal) {
    cancelDraftLoad();
  }
});

saveDraftButton.addEventListener("click", async () => {
  const isValid = validatePostRequiredFields();

  if (!isValid) {
    return;
  }

  const values = getPostFormValues();

  try {
    const result = draftState.exists
      ? await updateDraft({
          ...values,
          version: draftState.version,
        })
      : await saveDraft({
          ...values,
          version: draftState.version,
        });

    draftState.exists = true;
    draftState.loaded = true;
    draftState.version = result.data.version;
    draftState.pendingDraft = null;

    rememberHandledDraft(result.data);

    deleteDraftButton.hidden = false;

    clearHelpers(titleHelper, postBodyHelper);

    setMessage(
      draftMessage,
      `임시저장되었습니다. (${formatDateTime(result.data.updatedAt) || "최근"})`,
      "success"
    );
  } catch (error) {
    setMessage(draftMessage, error.message, "error");
  }
});

deleteDraftButton.addEventListener("click", async () => {
  const confirmed = confirm("임시저장 글을 삭제하시겠습니까?");

  if (!confirmed) {
    return;
  }

  const shouldClearForm = draftState.loaded;

  try {
    await deleteDraft();

    draftState.exists = false;
    draftState.loaded = false;
    draftState.version = 0;
    draftState.pendingDraft = null;

    forgetHandledDraft();

    if (shouldClearForm) {
      uploadForm.reset();
    }

    clearHelpers(titleHelper, postBodyHelper);
    setMessage(uploadMessage, "");

    closeDraftLoadModal();
    deleteDraftButton.hidden = true;

    setMessage(draftMessage, "임시저장 글이 삭제되었습니다.", "success");
  } catch (error) {
    setMessage(draftMessage, error.message, "error");
  }
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isValid = validatePostRequiredFields();

  if (!isValid) {
    return;
  }

  const values = getPostFormValues();

  try {
    if (draftState.exists && draftState.loaded) {
      await publishDraft({
        ...values,
        version: draftState.version,
      });

      forgetHandledDraft();
    } else {
      await postUpload({
        ...values,
      });
    }

    window.location.href = "./postList.html";
  } catch (error) {
    setMessage(uploadMessage, error.message, "error");
  }
});

loadCurrentDraft();