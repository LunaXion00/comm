import { renderHeader } from "../components/header.js";
import { getCommentList, postComment, modifyComment, deleteComment } from "../services/commentApi.js";
import { deletePost, getPostDetail, likePost, unlikePost, reportPost } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { formatCount, formatDateTime } from "../utils/format.js";
import { ReportReason, ReportReasonLabel } from "../components/reportReason.js";

const accessToken = requireLogin();
const loginNickname = localStorage.getItem("nickname");

renderHeader();

const postDetail = document.querySelector("#postDetail");
const message = document.querySelector("#message");

const likeButton = document.querySelector("#likeButton");
const likeCount = document.querySelector("#likeCount");
const likeText = document.querySelector("#likeText");
const viewCount = document.querySelector("#viewCount");
const commentCount = document.querySelector("#commentCount");

const commentForm = document.querySelector("#commentForm");
const commentBodyInput = document.querySelector("#commentBody");
const commentSubmitButton = commentForm.querySelector('button[type="submit"]');

const commentList = document.querySelector("#commentList");

const reportOpenButton = document.querySelector("#reportOpenButton");
const reportForm = document.querySelector("#reportForm");
const reportReason = document.querySelector("#reportReason");
const reportDescription = document.querySelector("#reportDescription");
const reportCancelButton = document.querySelector("#reportCancelButton");

var currentLiked = false;
var currentLikes = 0;

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

if (!postId) {
  alert("게시글 ID가 없습니다.");
  window.location.href = "./postList.html";
  throw new Error("게시글 ID가 없습니다.");
}


likeButton.addEventListener("click", async () => {
  try {
    if (currentLiked) {
      await unlikePost({
        accessToken,
        postId,
      });

      currentLiked = false;
      currentLikes -= 1;
    } else {
      await likePost({
        accessToken,
        postId,
      });

      currentLiked = true;
      currentLikes += 1;
    }

    updateLikeButton();
  } catch (error) {
    message.textContent = error.message;
  }
});

function updateCommentButtonState() {
  const commentBody = commentBodyInput.value.trim();

  commentSubmitButton.disabled = !commentBody;
}

commentBodyInput.addEventListener("input", updateCommentButtonState);

commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const commentBody = commentBodyInput.value.trim();

  if (!commentBody) {
    message.textContent = "댓글 내용을 입력해주세요.";
    return;
  }

  try {
    await postComment({
      accessToken: accessToken,
      postId: postId,
      commentBody: commentBody,
    });

    commentBodyInput.value = "";
    updateCommentButtonState();

    await loadCommentList();
    await loadPostDetail();
  } catch (error) {
    message.textContent = error.message;
  }
});

commentList.addEventListener("click", async (event) => {
  const commentItem = event.target.closest(".comment-item");

  if (!commentItem) {
    return;
  }

  const commentId = commentItem.dataset.commentId;

  if (!commentId) {
    message.textContent = "댓글 ID를 찾을 수 없습니다.";
    return;
  }

  if (event.target.classList.contains("comment-edit-button")) {
    showCommentEditForm(commentItem, commentId);
  }

  if (event.target.classList.contains("comment-delete-button")) {
    await handleDeleteComment(commentId);
  }

  if (event.target.classList.contains("comment-save-button")) {
    await handleModifyComment(commentItem, commentId);
  }

  if (event.target.classList.contains("comment-cancel-button")) {
    await loadCommentList();
  }
});


function updateLikeButton() {
  likeCount.textContent = formatCount(currentLikes);
  if (currentLiked) {
    likeText.textContent = "좋아요 취소";
    likeButton.classList.add("active");
  } else {
    likeText.textContent = "좋아요수";
    likeButton.classList.remove("active");
  }
}

function renderReportReasonOptions() {
  reportReason.innerHTML = `<option value="">신고 사유 선택</option>`;

  Object.values(ReportReason).forEach((reason) => {
    const option = document.createElement("option");

    option.value = reason;
    option.textContent = ReportReasonLabel[reason];

    reportReason.appendChild(option);
  });
}

reportOpenButton.addEventListener("click", () => {
  reportForm.hidden = false;
  reportOpenButton.hidden = true;
});

reportCancelButton.addEventListener("click", () => {
  reportForm.hidden = true;
  reportOpenButton.hidden = false;
  reportForm.reset();
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reason = reportReason.value;
  const description = reportDescription.value.trim();

  if (!reason) {
    message.textContent = "신고 사유를 선택해주세요.";
    return;
  }

  try {
    const result = await reportPost({
      accessToken,
      postId,
      reason,
      description,
    });

    alert(result.message || "신고가 접수되었습니다.");

    reportForm.hidden = true;
    reportOpenButton.hidden = false;
    reportForm.reset();
  } catch (error) {
    if (error.status === 409 || error.message.includes("409")) {
      alert("이미 신고한 게시글입니다.");
      return;
    }
    alert(error.message);
  }
});

function bindPostOwnerButtons() {
  const postModifyButton = document.querySelector("#postModifyButton");
  const postDeleteButton = document.querySelector("#postDeleteButton");

  postModifyButton.addEventListener("click", () => {
    window.location.href = `./postModify.html?postId=${postId}`;
  });

  postDeleteButton.addEventListener("click", async () => {
    const confirmed = confirm("게시글을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      const result = await deletePost({
        accessToken,
        postId,
      });

      alert(result.message);
      window.location.href = "./postList.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function renderPostDetail(data) {
  const author = data.author;
  const post = data.post;
  const meta = data.meta;

  currentLiked = meta.liked;
  currentLikes = meta.likes;

  const isOwner = loginNickname === author.nickname;

  postDetail.innerHTML = `
    <div class="post-title-row">
      <h1>${post.title}</h1>

      ${isOwner
      ? `
            <div class="post-owner-actions">
              <button id="postModifyButton" type="button">수정</button>
              <button id="postDeleteButton" type="button">삭제</button>
            </div>
          `
      : ""
    }
    </div>

    <section>
      <p>작성자: ${author.nickname}</p>
      ${author.profileImageUrl
      ? `<img src="${author.profileImageUrl}" alt="프로필 이미지" width="40" height="40" />`
      : ""
    }
      <p>작성일: ${formatDateTime(post.createdAt)}</p>
      <p>조회수: ${formatCount(meta.views)}</p>
      <p>댓글: ${formatCount(meta.comments)}</p>
    </section>

    <section>
      <p>${post.postBody}</p>
    </section>
  `;

  likeCount.textContent = formatCount(currentLikes);
  viewCount.textContent = formatCount(meta.views);
  commentCount.textContent = formatCount(meta.comments);
  updateLikeButton();

  if (isOwner) {
    bindPostOwnerButtons();
  }
}

async function loadPostDetail() {
  try {
    const result = await getPostDetail({
      accessToken,
      postId,
    });

    renderPostDetail(result.data);
  } catch (error) {
    message.textContent = error.message;
  }
}

function showCommentEditForm(commentItem, commentId) {
  const bodyElement = commentItem.querySelector(".comment-body");
  const currentBody = bodyElement.textContent;

  bodyElement.outerHTML = `
    <div class="comment-edit-form">
      <textarea class="comment-edit-input">${currentBody}</textarea>
      <button type="button" class="comment-save-button">저장</button>
      <button type="button" class="comment-cancel-button">취소</button>
    </div>
  `;
}

async function handleModifyComment(commentItem, commentId) {
  const editInput = commentItem.querySelector(".comment-edit-input");
  const commentBody = editInput.value.trim();

  if (!commentBody) {
    message.textContent = "댓글 내용을 입력해주세요.";
    return;
  }

  try {
    await modifyComment({
      accessToken,
      postId,
      commentId,
      commentBody,
    });

    await loadCommentList();
  } catch (error) {
    message.textContent = error.message;
  }
}

async function handleDeleteComment(commentId) {
  const confirmed = confirm("댓글을 삭제하시겠습니까?");

  if (!confirmed) {
    return;
  }

  try {
    await deleteComment({
      accessToken: accessToken,
      postId: postId,
      commentId: commentId,
    });

    await loadCommentList();
    await loadPostDetail();
  } catch (error) {
    message.textContent = error.message;
  }
}

function renderCommentList(data) {
  if (!data || data.length === 0) {
    commentList.textContent = "댓글이 없습니다.";
    return;
  }

  commentList.innerHTML = data
    .map((item) => {
      const author = item.author;
      const comment = item.comment;
      const isOwner = author.nickname === loginNickname;
      const isDeleted = comment.deleted === true;
      const canModify = isOwner && !isDeleted;

      return `
        <article class="comment-item" data-comment-id="${comment.commentId}">
          <div>
            ${author.profileImageUrl
          ? `<img src="${author.profileImageUrl}" alt="프로필 이미지" width="32" height="32" />`
          : ""
        }
            <strong>${author.nickname}</strong>
          </div>

          <p class="comment-body">${comment.commentBody}</p>
          <small>${formatDateTime(comment.createdAt) || ""}</small>

          ${canModify
          ? `
                <div class="comment-actions">
                  <button type="button" class="comment-edit-button">수정</button>
                  <button type="button" class="comment-delete-button">삭제</button>
                </div>
              `
          : ""
        }
        </article>
      `;
    })
    .join("");
}

async function loadCommentList() {
  try {
    const result = await getCommentList({
      accessToken,
      postId,
    });
    renderCommentList(result.data);
  } catch (error) {
    message.textContent = error.message;
  }
}

renderReportReasonOptions();
loadPostDetail();
loadCommentList();
updateCommentButtonState();
