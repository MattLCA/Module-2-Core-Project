const API_BASE_URL = "http://localhost:4000/api";

async function apiFetch(path, options = {}) {

    const token = localStorage.getItem("authToken");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = body.message || body.error || "Request failed";
        throw new Error(message);
    }

    return body;
}