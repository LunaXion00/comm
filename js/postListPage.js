import { renderHeader } from "../components/header.js";
import { getPostList } from "../services/postApi.js";
import { requireLogin } from "../utils/auth.js";
import { formatDateTime, formatCount } from "../utils/format.js";

const accessToken = requireLogin();
renderHeader();

const postList = document.querySelector("#postList");
const message = document.querySelector("#message");
const postWriteButton = document.querySelector("#postWriteButton");

postWriteButton.addEventListener("click", () => {
    window.location.href = "./postCreate.html";
});

function renderPostItem(item) {
    const author = item.author;
    const post = item.post;

    const profileImageUrl = author.profileImageUrl || "";
    const nickname = author.nickname || "알 수 없음";

    return `
    <article class="post-item">
      <a href="./postDetail.html?postId=${post.postId}">
        <h2>${post.title}</h2>

        <div class="post-meta">
          <span>좋아요 ${formatCount(post.likes)}</span>
          <span>댓글 ${formatCount(post.comments)}</span>
          <span>조회수 ${formatCount(post.views)}</span>
          <span>${formatDateTime(post.createdAt)}</span>
        </div>

        <div class="author">
          ${profileImageUrl
            ? `<img src="${profileImageUrl}" alt="프로필 이미지" width="32" height="32" />`
            : ""
        }
          <span>${nickname}</span>
        </div>
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
            postList.textContent = "게시글이 없습니다.";
            return;
        }
        postList.innerHTML = posts.map(renderPostItem).join("");
    } catch(error){
        message.textContent = error.message;
    }
}

renderPostList();