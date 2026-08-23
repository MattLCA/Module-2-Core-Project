// ============================================================
// ModernTech HR API Helper
// ============================================================

const API_BASE_URL =
    "http://localhost:4000/api";


// ============================================================
// GET HR TOKEN
// ============================================================

function getHrToken() {

    return (
        localStorage.getItem("hrToken") ||
        null
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

        return JSON.parse(stored);

    } catch (error) {

        console.error(
            "Could not parse HR employee:",
            error
        );

        return null;
    }
}


// ============================================================
// CLEAR HR SESSION
// ============================================================

function clearHrSession() {

    localStorage.removeItem(
        "hrToken"
    );

    localStorage.removeItem(
        "hrEmployee"
    );

    localStorage.removeItem(
        "hrRole"
    );
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


    let response;

    try {

        response =
            await fetch(
                `${API_BASE_URL}${path}`,
                {
                    ...options,
                    headers
                }
            );

    } catch (error) {

        console.error(
            "[HR API] Backend connection failed:",
            error
        );

        throw new Error(
            "Could not connect to the ModernTech backend. Make sure the backend is running on port 4000."
        );
    }


    let body = {};


    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            body =
                await response.json();

        } catch (error) {

            console.error(
                "[HR API] Could not parse JSON response:",
                error
            );

        }
    }


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

        clearHrSession();

        window.location.href =
            "index.html";

        return null;
    }


    // ========================================================
    // FORBIDDEN
    // ========================================================

    if (
        response.status === 403
    ) {

        throw new Error(
            body.error ||
            body.message ||
            "You do not have permission to access this resource."
        );
    }


    // ========================================================
    // OTHER ERRORS
    // ========================================================

    if (!response.ok) {

        throw new Error(
            body.error ||
            body.message ||
            `Request failed with status ${response.status}`
        );
    }


    return body;
}


// ============================================================
// LOGOUT HR
// ============================================================

function hrLogout() {

    clearHrSession();

    window.location.href =
        "index.html";
}


// ============================================================
// GLOBALS
// ============================================================

window.getHrToken =
    getHrToken;

window.getHrEmployee =
    getHrEmployee;

window.clearHrSession =
    clearHrSession;

window.hrLogout =
    hrLogout;

window.apiFetch =
    apiFetch;