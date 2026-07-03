export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function getLoginUser() {
    return {
        userId: localStorage.getItem("userId"),
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
        nickname: localStorage.getItem("nickname"),
        profileImageUrl: localStorage.getItem("profileImageUrl"),
    };
}

export function requireLogin() {
    const accessToken = getAccessToken();

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        throw new Error("로그인이 필요합니다.");
    }

    return accessToken;
}

export function redirectIfLoggedIn() {
    const accessToken = getAccessToken();

    if (accessToken) {
        window.location.href = "./postList.html";
    }
}

export function clearLoginUser() {
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("profileImageUrl");
}