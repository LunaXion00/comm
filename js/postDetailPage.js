import { renderHeader } from "../components/header.js";
import { getCommentList, postComment, modifyComment, deleteComment } from "../services/commentApi.js";
import { deletePost, getPostDetail, likePost, unlikePost, reportPost } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { formatCount, formatDateTime } from "../utils/format.js";
import { ReportReason, ReportReasonLabel } from "../components/reportReason.js";

const accessToken = requireLogin();
const loginNickname = localStorage.getItem("nickname");

renderHeader();

const postDetailContent = document.querySelector("#postDetailContent");
const message = document.querySelector("#message");

const likeButton = document.querySelector("#likeButton");
const likeCount = document.querySelector("#likeCount");
const likeText = document.querySelector("#likeText");
const commentCount = document.querySelector("#commentCount");

const commentForm = document.querySelector("#commentForm");
const commentBodyInput = document.querySelector("#commentBody");
const commentSubmitButton = commentForm.querySelector('button[type="submit"]');
const commentList = document.querySelector("#commentList");

const reportModal = document.querySelector("#reportModal");
const reportForm = document.querySelector("#reportForm");
const reportReason = document.querySelector("#reportReason");
const reportDescription = document.querySelector("#reportDescription");
const reportMessage = document.querySelector("#reportMessage");
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
        postId,
      });

      currentLiked = false;
      currentLikes -= 1;
    } else {
      await likePost({
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMultilineText(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderProfileImage(author, size = 40) {
  const profileImageUrl = author.profileImageUrl || "./assets/default-profile.png";

  if (!profileImageUrl) {
    return `<span class="detail-profile-placeholder" style="width: ${size}px; height: ${size}px;"></span>`;
  }

  return `
    <img
      class="detail-profile-image"
      src="${escapeHtml(profileImageUrl)}"
      alt="프로필 이미지"
      width="${size}"
      height="${size}"
    />
  `;
}

function renderModifiedText(post) {
  if (!post.modified || !post.modifiedAt) {
    return "";
  }

  return `<span>수정일 ${formatDateTime(post.modifiedAt)}</span>`;
}

function renderPostImage(postImageUrl) {
  if (!postImageUrl) {
    return "";
  }

  return `
    <figure class="post-detail-image-wrap">
      <img src="${escapeHtml(postImageUrl)}" alt="게시글 이미지" />
    </figure>
  `;
}


function updateLikeButton() {
  likeCount.textContent = formatCount(currentLikes);

  if (currentLiked) {
    likeText.textContent = "좋아요 취소";
    likeButton.classList.add("active");
  } else {
    likeText.textContent = "좋아요";
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
function setReportMessage(text) {
  reportMessage.textContent = text;
  reportMessage.className = text ? "message error" : "message";
}

function openReportModal() {
  setReportMessage("");
  reportModal.hidden = false;
  reportReason.focus();
}

function closeReportModal() {
  reportModal.hidden = true;
  reportForm.reset();
  setReportMessage("");
}

reportCancelButton.addEventListener("click", closeReportModal);

reportModal.addEventListener("click", (event) => {
  if (event.target === reportModal) {
    closeReportModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !reportModal.hidden) {
    closeReportModal();
  }
});

reportForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reason = reportReason.value;
  const description = reportDescription.value.trim();

  if (!reason) {
    setReportMessage("신고 사유를 선택해주세요.");
    reportReason.focus();
    return;
  }

  try {
    const result = await reportPost({
      postId,
      reason,
      description,
    });

    closeReportModal();
    alert(result.message || "신고가 접수되었습니다.");
  } catch (error) {
    const errorMessage = String(error.message || "");

    if (error.status === 409 || errorMessage.includes("409")) {
      setReportMessage("이미 신고한 게시글입니다.");
      return;
    }

    setReportMessage(errorMessage || "신고 처리 중 문제가 발생했습니다.");
  }
});

function bindPostHeaderButtons() {
  const reportOpenButton = document.querySelector("#reportOpenButton");
  const postModifyButton = document.querySelector("#postModifyButton");
  const postDeleteButton = document.querySelector("#postDeleteButton");

  reportOpenButton.addEventListener("click", openReportModal);

  if (postModifyButton) {
    postModifyButton.addEventListener("click", () => {
      window.location.href = `./postModify.html?postId=${postId}`;
    });
  }

  if (postDeleteButton) {
    postDeleteButton.addEventListener("click", async () => {
      const confirmed = confirm("게시글을 삭제하시겠습니까?");

      if (!confirmed) {
        return;
      }

      try {
        const result = await deletePost({
          postId,
        });

        alert(result.message || "게시글이 삭제되었습니다.");
        window.location.href = "./postList.html";
      } catch (error) {
        message.textContent = error.message;
      }
    });
  }
}

function renderPostDetail(data) {
  const author = data.author || {};
  const post = data.post || {};
  const meta = data.meta || {};

  currentLiked = Boolean(meta.liked);
  currentLikes = Number(meta.likes) || 0;

  const isOwner = loginNickname === author.nickname;

  postDetailContent.innerHTML = `
    <header class="post-detail-header">
      <div class="post-detail-heading">
        <a class="post-detail-back-link" href="./postList.html">
          목록으로
        </a>

        <div class="post-detail-title-row">
          <h1>${escapeHtml(post.title || "제목 없음")}</h1>
          <span class="post-detail-view-count">
            조회수 ${formatCount(meta.views)}
          </span>
        </div>

        <div class="post-detail-author">
          ${renderProfileImage(author, 44)}

          <div>
            <strong>${escapeHtml(author.nickname || "알 수 없음")}</strong>

            <div class="post-detail-date">
              <span>작성일 ${formatDateTime(post.createdAt)}</span>
              ${renderModifiedText(post)}
            </div>
          </div>
        </div>
      </div>

      <div class="post-header-actions">
        ${
          isOwner
            ? `
              <button id="postModifyButton" type="button">수정</button>
              <button id="postDeleteButton" type="button">삭제</button>
            `
            : ""
        }

        <button
          id="reportOpenButton"
          class="secondary-button"
          type="button"
        >
          신고하기
        </button>
      </div>
    </header>

    ${renderPostImage(post.postImageUrl)}

    <section class="post-detail-body">
      ${renderMultilineText(post.postBody || "")}
    </section>
  `;

  commentCount.textContent = `[${formatCount(meta.comments)}]`;

  updateLikeButton();
  bindPostHeaderButtons();
}

async function loadPostDetail() {
  try {
    const result = await getPostDetail({
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
      <textarea class="comment-edit-input">${escapeHtml(currentBody)}</textarea>

      <div class="comment-actions">
        <button type="button" class="comment-save-button">저장</button>
        <button type="button" class="comment-cancel-button">취소</button>
      </div>
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
      postId: postId,
      commentId: commentId,
    });

    await loadCommentList();
    await loadPostDetail();
  } catch (error) {
    message.textContent = error.message;
  }
}

const MAX_COMMENT_DEPTH = 3;

function getCommentDepth(comment) {
  const depth = Number(comment.depth ?? comment.commentDepth ?? 0);

  if (!Number.isFinite(depth) || depth < 0) {
    return 0;
  }

  return Math.min(depth, MAX_COMMENT_DEPTH);
}

function renderCommentList(data) {
  if (!data || data.length === 0) {
    commentList.innerHTML = `<p class="comment-empty">댓글이 없습니다.</p>`;
    return;
  }

  commentList.innerHTML = data
    .map((item) => {
      const author = item.author || {};
      const comment = item.comment || {};
      const isOwner = author.nickname === loginNickname;
      const isDeleted = comment.deleted === true;
      const canModify = isOwner && !isDeleted;
      const depth = getCommentDepth(comment);
      const replyClass = depth > 0 ? "is-reply" : "";
      const profileSize = depth > 0 ? 24 : 28;

      return `
        <article
          class="comment-item ${isDeleted ? "is-deleted" : ""} ${replyClass}"
          style="--comment-depth: ${depth};"
          data-comment-id="${escapeHtml(comment.commentId || "")}"
          data-comment-depth="${depth}"
        >
          <header class="comment-header">
            <div class="comment-author">
              ${renderProfileImage(author, profileSize)}

              <div>
                <strong>${escapeHtml(author.nickname || "알 수 없음")}</strong>
                <small>${formatDateTime(comment.createdAt) || ""}</small>
              </div>
            </div>

            ${
              canModify
                ? `
                  <div class="comment-actions">
                    <button type="button" class="comment-edit-button">수정</button>
                    <button type="button" class="comment-delete-button">삭제</button>
                  </div>
                `
                : ""
            }
          </header>

          <p class="comment-body">${renderMultilineText(comment.commentBody || "")}</p>
        </article>
      `;
    })
    .join("");
}

async function loadCommentList() {
  try {
    const result = await getCommentList({
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
