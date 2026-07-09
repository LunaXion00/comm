import { renderHeader } from "../components/header.js";
import { getPostList } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { formatCount, formatDateTime } from "../utils/format.js";

const accessToken = requireLogin();
renderHeader();

const postList = document.querySelector("#postList");
const message = document.querySelector("#message");
const postWriteButton = document.querySelector("#postWriteButton");

postWriteButton.addEventListener("click", () => {
  window.location.href = "./postCreate.html";
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPostListHeader() {
  return `
    <div class="post-list-header">
      <span>좋아요</span>
      <span>번호</span>
      <span>제목</span>
      <span>작성자</span>
      <span>작성시간</span>
      <span>조회수</span>
    </div>
  `;
}

function renderLikeText(likes) {
  const likeCount = Number(likes) || 0;

  if (likeCount <= 0) {
    return "";
  }

  return `<span class="post-like-badge">♥ ${formatCount(likeCount)}</span>`;
}

function renderCommentBadge(comments) {
  const commentCount = Number(comments) || 0;

  if (commentCount <= 0) {
    return "";
  }

  return `<span class="post-comment-badge">[${formatCount(commentCount)}]</span>`;
}

function renderPostItem(item) {
  const author = item.author || {};
  const post = item.post || {};

  const postId = post.postId ?? "";
  const title = post.title || "제목 없음";
  const nickname = author.nickname || "알 수 없음";

  return `
    <article class="post-row">
      <a class="post-row-link" href="./postDetail.html?postId=${encodeURIComponent(postId)}">
        <span class="post-like-cell">${renderLikeText(post.likes)}</span>
        <span class="post-id-cell">${escapeHtml(postId)}</span>

        <span class="post-title-cell">
          <span class="post-title-text">${escapeHtml(title)}</span>
          ${renderCommentBadge(post.comments)}
        </span>

        <span class="post-author-cell">${escapeHtml(nickname)}</span>

        <time class="post-time-cell" datetime="${escapeHtml(post.createdAt)}">
          ${formatDateTime(post.createdAt)}
        </time>

        <span class="post-views-cell">${formatCount(post.views)}</span>
      </a>
    </article>
  `;
}

async function renderPostList() {
  try {
    const result = await getPostList({
      accessToken,
    });

    const posts = result.data;

    if (!posts || posts.length === 0) {
      postList.innerHTML = `
        ${renderPostListHeader()}
        <p class="post-list-empty">게시글이 없습니다.</p>
      `;
      return;
    }

    postList.innerHTML = `
      ${renderPostListHeader()}
      ${posts.map(renderPostItem).join("")}
    `;
  } catch (error) {
    message.textContent = error.message;
  }
}

renderPostList();