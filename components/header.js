import { logout } from "../services/userApi.js";

export function renderHeader() {
  const headerContainer = document.querySelector("#header");
  if (!headerContainer) {
    return;
  }
  const profileImageUrl = localStorage.getItem("profileImageUrl") || "";

  headerContainer.innerHTML = `
    <header class="site-header">
      <a class="site-title" href="./postList.html">게시글 목록으로</a>

      <div class="header-profile">
        <button id="profileMenuButton" class="profile-menu-button" type="button">
          ${
            profileImageUrl
              ? `<img src="${profileImageUrl}" alt="프로필 이미지" />`
              : `<span class="profile-placeholder"></span>`
          }
        </button>

        <nav id="profileDropdown" class="profile-dropdown" hidden>
          <a href="./modifyInfo.html">회원정보 수정</a>
          <a href="./passwordModify.html">비밀번호 변경</a>
          <button id="logoutButton" type="button">로그아웃</button>
        </nav>
      </div>
    </header>
  `;

  const profileMenuButton = document.querySelector("#profileMenuButton");
  const profileDropdown = document.querySelector("#profileDropdown");
  const logoutButton = document.querySelector("#logoutButton");

  profileMenuButton.addEventListener("click", () => {
    profileDropdown.hidden = !profileDropdown.hidden;
  });

  document.addEventListener("click", (event) => {
    const isInsideProfileMenu = event.target.closest(".header-profile");

    if (!isInsideProfileMenu) {
      profileDropdown.hidden = true;
    }
  });

  logoutButton.addEventListener("click", async () => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      if (accessToken) {
        await logout(accessToken);
      }
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.clear();
      window.location.href = "./login.html";
    }
  });
}