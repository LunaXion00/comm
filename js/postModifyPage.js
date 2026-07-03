import { renderHeader } from "../components/header.js";
import { getPostDetail, modifyPost } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";

const modifyPostForm = document.querySelector("#modifyPostForm");
const titleInput = document.querySelector("#title");
const postBodyInput = document.querySelector("#postBody");
const postImageUrlInput = document.querySelector("#postImageUrl");
const modifyMessage = document.querySelector("#modifyMessage");
const successPopup = document.querySelector("#successPopup");

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

if (!postId) {
  alert("게시글 ID가 없습니다.");
  window.location.href = "./postList.html";
}

const accessToken = requireLogin();
const nickname = localStorage.getItem("nickname");

async function loadPostForModify() {
    try {
        const result = await getPostDetail({
            accessToken,
            postId,
        });
        const data = result.data;
        const author = data.author;
        const post = data.post;

        const isOwner = author.nickname === nickname;
        if (!isOwner) {
            alert("게시글 작성자만 수정할 수 있습니다.");
            window.location.href = `./postDetail.html?postId=${postId}`;
            return;
        }
        modifyPostForm.hidden = false;
        titleInput.value = post.title || "";
        postBodyInput.value = post.postBody || "";
        postImageUrlInput.value = post.postImageUrl || "";
    } catch (error) {
        modifyMessage.textContent = error.message;
    }
}

modifyPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const title = titleInput.value.trim();
        const postBody = postBodyInput.value.trim();
        const postImageUrl = postImageUrlInput.value.trim();

        const result = await modifyPost({
            accessToken,
            postId,
            title,
            postBody,
            postImageUrl,
        });
        window.location.href = `./postDetail.html?postId=${postId}`;
    } catch (error) {
        modifyMessage.textContent = error.message;
    }
});
renderHeader();
loadPostForModify();