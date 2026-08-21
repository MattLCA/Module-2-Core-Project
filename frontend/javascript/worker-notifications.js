// ============================================================
// ModernTech Worker Notifications
// ============================================================
//
// Handles:
// - Loading notifications
// - Unread notification count
// - Marking one notification as read
// - Marking all notifications as read
// - Opening/viewing a notification
//
// Authentication is handled by worker_api.js.
// API endpoints:
//
// GET   /api/worker/notifications
// GET   /api/worker/notifications/unread
// GET   /api/worker/notifications/unread-count
// GET   /api/worker/notifications/:id
// PATCH /api/worker/notifications/:id/read
// PATCH /api/worker/notifications/read-all
//
// ============================================================

console.log("Worker Notifications JS connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeNotifications();
});


// ============================================================
// INITIALIZE
// ============================================================

async function initializeNotifications() {

    // --------------------------------------------------------
    // Make sure the worker is logged in
    // --------------------------------------------------------

    if (typeof requireWorkerLogin === "function") {

        if (!requireWorkerLogin()) {
            return;
        }

    }


    // --------------------------------------------------------
    // Load stored employee into sidebar
    // --------------------------------------------------------

    if (typeof initializeStoredEmployee === "function") {
        initializeStoredEmployee();
    }


    // --------------------------------------------------------
    // Load notifications
    // --------------------------------------------------------

    await loadNotifications();

    await loadUnreadCount();


    // --------------------------------------------------------
    // Setup notification actions
    // --------------------------------------------------------

    initializeNotificationEvents();

}


// ============================================================
// LOAD ALL NOTIFICATIONS
// ============================================================

async function loadNotifications() {

    try {

        if (typeof getWorkerNotifications !== "function") {

            console.error(
                "getWorkerNotifications() is not available."
            );

            return;

        }


        const response =
            await getWorkerNotifications();


        console.log(
            "Worker notifications response:",
            response
        );


        const notifications =
            extractNotificationArray(response);


        renderNotifications(notifications);


    } catch (error) {

        console.error(
            "Could not load worker notifications:",
            error
        );


        renderNotificationError(
            error.message ||
            "Could not load notifications."
        );

    }

}


// ============================================================
// LOAD UNREAD COUNT
// ============================================================

async function loadUnreadCount() {

    try {

        if (
            typeof getUnreadWorkerNotificationCount !==
            "function"
        ) {

            return;

        }


        const response =
            await getUnreadWorkerNotificationCount();


        console.log(
            "Unread notification count:",
            response
        );


        const count =
            extractUnreadCount(response);


        updateNotificationBadges(count);


    } catch (error) {

        console.error(
            "Could not load unread notification count:",
            error
        );

    }

}


// ============================================================
// EXTRACT NOTIFICATION ARRAY
// ============================================================

function extractNotificationArray(response) {

    if (!response) {
        return [];
    }


    // --------------------------------------------------------
    // { data: [...] }
    // --------------------------------------------------------

    if (Array.isArray(response.data)) {
        return response.data;
    }


    // --------------------------------------------------------
    // { notifications: [...] }
    // --------------------------------------------------------

    if (Array.isArray(response.notifications)) {
        return response.notifications;
    }


    // --------------------------------------------------------
    // { data: { notifications: [...] } }
    // --------------------------------------------------------

    if (
        response.data &&
        Array.isArray(response.data.notifications)
    ) {

        return response.data.notifications;

    }


    // --------------------------------------------------------
    // Direct array
    // --------------------------------------------------------

    if (Array.isArray(response)) {
        return response;
    }


    return [];

}


// ============================================================
// EXTRACT UNREAD COUNT
// ============================================================

function extractUnreadCount(response) {

    if (!response) {
        return 0;
    }


    // --------------------------------------------------------
    // { data: { count: 5 } }
    // --------------------------------------------------------

    if (
        response.data &&
        typeof response.data.count === "number"
    ) {

        return response.data.count;

    }


    // --------------------------------------------------------
    // { count: 5 }
    // --------------------------------------------------------

    if (
        typeof response.count === "number"
    ) {

        return response.count;

    }


    // --------------------------------------------------------
    // { data: 5 }
    // --------------------------------------------------------

    if (
        typeof response.data === "number"
    ) {

        return response.data;

    }


    // --------------------------------------------------------
    // { unreadCount: 5 }
    // --------------------------------------------------------

    if (
        typeof response.unreadCount === "number"
    ) {

        return response.unreadCount;

    }


    // --------------------------------------------------------
    // { data: { unreadCount: 5 } }
    // --------------------------------------------------------

    if (
        response.data &&
        typeof response.data.unreadCount === "number"
    ) {

        return response.data.unreadCount;

    }


    return 0;

}


// ============================================================
// RENDER NOTIFICATIONS
// ============================================================

function renderNotifications(notifications) {

    const container =
        findNotificationContainer();


    if (!container) {

        console.warn(
            "Notification container was not found."
        );

        return;

    }


    // --------------------------------------------------------
    // No notifications
    // --------------------------------------------------------

    if (!notifications.length) {

        container.innerHTML = `
            <div class="notification-empty">
                <i class="ti ti-bell-off"></i>

                <h3>No notifications</h3>

                <p>
                    You don't have any notifications right now.
                </p>
            </div>
        `;

        return;

    }


    // --------------------------------------------------------
    // Render notifications
    // --------------------------------------------------------

    container.innerHTML =
        notifications
            .map(
                notification =>
                    createNotificationHTML(
                        notification
                    )
            )
            .join("");

}


// ============================================================
// FIND NOTIFICATION CONTAINER
// ============================================================

function findNotificationContainer() {

    return (
        document.getElementById(
            "notificationsList"
        ) ||

        document.getElementById(
            "notificationList"
        ) ||

        document.getElementById(
            "notificationsContainer"
        ) ||

        document.querySelector(
            ".notifications-list"
        ) ||

        document.querySelector(
            ".notification-list"
        )
    );

}


// ============================================================
// CREATE NOTIFICATION HTML
// ============================================================

function createNotificationHTML(notification) {

    const id =
        notification.id ??
        notification.notification_id ??
        notification.notificationId;


    const title =
        notification.title ||
        notification.subject ||
        notification.type ||
        "Notification";


    const message =
        notification.message ||
        notification.description ||
        notification.body ||
        "";


    const createdAt =
        notification.created_at ||
        notification.createdAt ||
        notification.date ||
        notification.timestamp;


    const isRead =
        notification.is_read === true ||
        notification.isRead === true ||
        notification.read === true ||
        notification.status === "read";


    const unreadClass =
        isRead
            ? ""
            : "unread";


    const dateText =
        formatNotificationDate(
            createdAt
        );


    return `
        <article
            class="notification-item ${unreadClass}"
            data-notification-id="${escapeHTML(id)}"
        >

            <div class="notification-icon">
                <i class="ti ti-bell"></i>
            </div>

            <div class="notification-content">

                <div class="notification-header">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    ${
                        !isRead
                            ? `
                                <span class="notification-unread">
                                    New
                                </span>
                              `
                            : ""
                    }

                </div>

                <p>
                    ${escapeHTML(message)}
                </p>

                <div class="notification-meta">

                    <span>
                        ${escapeHTML(dateText)}
                    </span>

                    ${
                        !isRead
                            ? `
                                <button
                                    type="button"
                                    class="notification-read-btn"
                                    data-action="mark-read"
                                    data-id="${escapeHTML(id)}"
                                >
                                    Mark as read
                                </button>
                              `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;

}


// ============================================================
// INITIALIZE NOTIFICATION EVENTS
// ============================================================

function initializeNotificationEvents() {

    const container =
        findNotificationContainer();


    if (!container) {
        return;
    }


    // --------------------------------------------------------
    // Event delegation
    // --------------------------------------------------------

    container.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const notificationId =
                button.dataset.id;


            if (
                action === "mark-read" &&
                notificationId
            ) {

                await markNotificationRead(
                    notificationId
                );

            }

        }
    );

}


// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

async function markNotificationRead(
    notificationId
) {

    try {

        if (
            typeof markWorkerNotificationAsRead !==
            "function"
        ) {

            throw new Error(
                "Notification API is unavailable."
            );

        }


        await markWorkerNotificationAsRead(
            notificationId
        );


        // ----------------------------------------------------
        // Update UI
        // ----------------------------------------------------

        const notification =
            document.querySelector(
                `[data-notification-id="${CSS.escape(
                    String(notificationId)
                )}"]`
            );


        if (notification) {

            notification.classList.remove(
                "unread"
            );


            const newBadge =
                notification.querySelector(
                    ".notification-unread"
                );


            if (newBadge) {
                newBadge.remove();
            }


            const button =
                notification.querySelector(
                    '[data-action="mark-read"]'
                );


            if (button) {
                button.remove();
            }

        }


        // ----------------------------------------------------
        // Refresh unread count
        // ----------------------------------------------------

        await loadUnreadCount();


        showNotificationToast(
            "Notification marked as read."
        );


    } catch (error) {

        console.error(
            "Could not mark notification as read:",
            error
        );


        showNotificationToast(
            error.message ||
            "Could not mark notification as read."
        );

    }

}


// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

async function markAllNotificationsRead() {

    try {

        if (
            typeof markAllWorkerNotificationsAsRead !==
            "function"
        ) {

            throw new Error(
                "Notification API is unavailable."
            );

        }


        await markAllWorkerNotificationsAsRead();


        // ----------------------------------------------------
        // Update notification cards
        // ----------------------------------------------------

        document
            .querySelectorAll(
                ".notification-item.unread"
            )
            .forEach((notification) => {

                notification.classList.remove(
                    "unread"
                );


                const badge =
                    notification.querySelector(
                        ".notification-unread"
                    );


                if (badge) {
                    badge.remove();
                }


                const button =
                    notification.querySelector(
                        '[data-action="mark-read"]'
                    );


                if (button) {
                    button.remove();
                }

            });


        // ----------------------------------------------------
        // Update count
        // ----------------------------------------------------

        updateNotificationBadges(0);


        showNotificationToast(
            "All notifications marked as read."
        );


    } catch (error) {

        console.error(
            "Could not mark all notifications as read:",
            error
        );


        showNotificationToast(
            error.message ||
            "Could not mark all notifications as read."
        );

    }

}


// ============================================================
// UPDATE NOTIFICATION BADGES
// ============================================================

function updateNotificationBadges(count) {

    const numericCount =
        Number(count) || 0;


    // --------------------------------------------------------
    // Common badge IDs
    // --------------------------------------------------------

    const badges = [

        document.getElementById(
            "notificationBadge"
        ),

        document.getElementById(
            "notificationsBadge"
        ),

        document.getElementById(
            "unreadNotificationCount"
        )

    ].filter(Boolean);


    badges.forEach((badge) => {

        if (numericCount > 0) {

            badge.textContent =
                numericCount > 99
                    ? "99+"
                    : String(numericCount);

            badge.hidden = false;

        } else {

            badge.textContent = "";

            badge.hidden = true;

        }

    });


    // --------------------------------------------------------
    // Sidebar notification badge
    // --------------------------------------------------------

    const notificationLink =
        document.querySelector(
            'a[href="worker-notifications.html"]'
        );


    if (notificationLink) {

        let badge =
            notificationLink.querySelector(
                ".notification-badge"
            );


        if (numericCount > 0) {

            if (!badge) {

                badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "notification-badge";

                notificationLink.appendChild(
                    badge
                );

            }


            badge.textContent =
                numericCount > 99
                    ? "99+"
                    : String(numericCount);

        } else if (badge) {

            badge.remove();

        }

    }

}


// ============================================================
// FORMAT NOTIFICATION DATE
// ============================================================

function formatNotificationDate(
    dateValue
) {

    if (!dateValue) {
        return "Recently";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(dateValue);

    }


    return date.toLocaleString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ============================================================
// RENDER ERROR
// ============================================================

function renderNotificationError(
    message
) {

    const container =
        findNotificationContainer();


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="notification-error">

            <i class="ti ti-alert-circle"></i>

            <h3>
                Unable to load notifications
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                class="btn"
                id="retryNotificationsBtn"
            >
                Try Again
            </button>

        </div>
    `;


    const retryButton =
        document.getElementById(
            "retryNotificationsBtn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            async () => {

                await loadNotifications();

                await loadUnreadCount();

            }
        );

    }

}


// ============================================================
// TOAST
// ============================================================

function showNotificationToast(
    message
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);

        return;

    }


    // Fallback if shared showToast() isn't loaded

    let toast =
        document.querySelector(
            ".toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2800);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.loadNotifications =
    loadNotifications;

window.loadUnreadCount =
    loadUnreadCount;

window.markNotificationRead =
    markNotificationRead;

window.markAllNotificationsRead =
    markAllNotificationsRead;

window.updateNotificationBadges =
    updateNotificationBadges;

window.extractNotificationArray =
    extractNotificationArray;