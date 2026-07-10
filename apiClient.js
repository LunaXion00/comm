const API_BASE_URL = "http://localhost:8080";

const accessToken = localStorage.getItem("accessToken");

export async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ accessToken,
            ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (response.status === 204) return null;
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(response.status, errorBody);

        const error = new Error(`API 요청 실패 : ${response.status}`);
        error.status = response.status;
        error.body = errorBody;
        throw error;
    }
    return response.json();
}