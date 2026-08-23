// ============================================================
// ModernTech HR API Helper
// ============================================================

const API_BASE_URL =
    "http://localhost:4000/api";


// ============================================================
// GET HR TOKEN
// ============================================================

function getHrToken() {

    return localStorage.getItem(
        "hrToken"
    );

}


// ============================================================
// GET HR EMPLOYEE
// ============================================================

function getHrEmployee() {

    const stored =
        localStorage.getItem(
            "hrEmployee"
        );


    if (!stored) {
        return null;
    }


    try {

        return JSON.parse(
            stored
        );

    } catch (error) {

        console.error(
            "Could not parse HR employee:",
            error
        );

        return null;

    }

}


// ============================================================
// HR API REQUEST
// ============================================================

async function apiFetch(
    path,
    options = {}
) {

    const token =
        getHrToken();


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...options,
                headers
            }
        );


    const body =
        await response
            .json()
            .catch(() => ({}));


    console.log(
        `[HR API] ${options.method || "GET"} ${path}`,
        response.status,
        body
    );


    // ========================================================
    // UNAUTHORIZED
    // ========================================================

    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "hrToken"
        );

        localStorage.removeItem(
            "hrEmployee"
        );

        localStorage.removeItem(
            "hrRole"
        );

        window.location.href =
            "index.html";

        return null;

    }


    // ========================================================
    // OTHER ERRORS
    // ========================================================

    if (!response.ok) {

        throw new Error(
            body.message ||
            body.error ||
            `Request failed with status ${response.status}`
        );

    }


    return body;

}


// ============================================================
// GLOBALS
// ============================================================

window.getHrToken =
    getHrToken;

window.getHrEmployee =
    getHrEmployee;

window.apiFetch =
    apiFetch;