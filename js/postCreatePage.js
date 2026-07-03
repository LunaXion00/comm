import { renderHeader } from "../components/header.js";
import { getCurrentDraft, saveDraft, updateDraft, publishDraft, deleteDraft } from "../services/draftApi.js";
import { postUpload } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";

renderHeader();

const accessToken = requireLogin();

const uploadForm = document.querySelector("#uploadForm");
const uploadMessage = document.querySelector("#uploadMessage");
const draftMessage = document.querySelector("#draftMessage");

const saveDraftButton = document.querySelector("#saveDraftButton");
const deleteDraftButton = document.querySelector("#deleteDraftButton");
const submitButton = uploadForm.querySelector('button[type="submit"]');

const titleInput= uploadForm.elements.title;
const postBodyInput = uploadForm.elements.postBody;
const postImageUrlInput = uploadForm.elements.postImageUrl;

const draftState = {
    exists: false,
    version: 0,
};

function getPostFormValues(){
    return{
        title: titleInput.value.trim(),
        postBody: postBodyInput.value.trim(),
        postImageUrl: postImageUrlInput.value.trim() || null,
    };
}

titleInput.addEventListener("input", updatePostCreateButtonState);
postBodyInput.addEventListener("input", updatePostCreateButtonState);

function updatePostCreateButtonState() {
  const title = titleInput.value.trim();
  const postBody = postBodyInput.value.trim();

  const isValid = title && postBody;

  submitButton.disabled = !isValid;
}

async function loadCurrentDraft(){
    try{
        const result = await getCurrentDraft({accessToken});
        if(!result || !result.data) return;

        const draft = result.data;
        draftState.exists = true;
        draftState.version = draft.version;
        
        titleInput.value = draft.title || "";
        postBodyInput.value = draft.postBody || "";
        postImageUrlInput.value = draft.postImageUrl || "";

        updatePostCreateButtonState();

        deleteDraftButton.hidden= false;
        draftMessage.textContent = "임시저장된 글을 불러왔습니다.";
    } catch(error){
        draftMessage.textContent = error.message;
    }
}

saveDraftButton.addEventListener("click", async () => {
  const values = getPostFormValues();

  try {
    const result = draftState.exists
      ? await updateDraft({
          accessToken,
          ...values,
          version: draftState.version,
        })
      : await saveDraft({
          accessToken,
          ...values,
          version: draftState.version,
        });

    draftState.exists = true;
    draftState.version = result.data.version;

    deleteDraftButton.hidden = false;
    draftMessage.textContent = "임시저장되었습니다.";
  } catch (error) {
    draftMessage.textContent = error.message;
  }
});

deleteDraftButton.addEventListener("click", async () => {
  const confirmed = confirm("임시저장 글을 삭제하시겠습니까?");

  if (!confirmed) {
    return;
  }

  try {
    await deleteDraft({ accessToken });

    draftState.exists = false;
    draftState.version = 0;

    uploadForm.reset();
    deleteDraftButton.hidden = true;
    draftMessage.textContent = "임시저장 글이 삭제되었습니다.";
  } catch (error) {
    draftMessage.textContent = error.message;
  }
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const values = getPostFormValues();

  try {
    if (draftState.exists) {
      await publishDraft({
        accessToken,
        ...values,
        version: draftState.version,
      });
    } else {
      await postUpload({
        accessToken,
        ...values,
      });
    }

    window.location.href = "./postList.html";
  } catch (error) {
    uploadMessage.textContent = error.message;
  }
});

loadCurrentDraft();
updatePostCreateButtonState();