// ============================================================
// ModernTech Worker Portal
// Worker Notifications
// ============================================================

console.log(
    "Worker Notifications JS connected."
);


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            typeof requireWorkerLogin === "function" &&
            !requireWorkerLogin()
        ) {
            return;
        }

        initializeNotifications();
    }
);


// ============================================================
// INITIALIZE NOTIFICATIONS
// ============================================================

async function initializeNotifications() {

    const tableBody =
        document.getElementById(
            "notificationsTable"
        );

    if (!tableBody) {
        return;
    }

    showNotificationLoading();

    try {

        const response =
            await getWorkerNotifications();

        const notifications =
            response?.data || [];

        renderNotifications(
            notifications
        );

        updateNotificationCount(
            notifications
        );

    } catch (error) {

        console.error(
            "Failed to load notifications:",
            error
        );

        showNotificationError(
            error.message
        );
    }

    initializeMarkAllRead();
}


// ============================================================
// LOADING STATE
// ============================================================

function showNotificationLoading() {

    const tableBody =
        document.getElementById(
            "notificationsTable"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="4">
                Loading notifications...
            </td>
        </tr>
    `;
}


// ============================================================
// ERROR STATE
// ============================================================

function showNotificationError(
    message
) {

    const tableBody =
        document.getElementById(
            "notificationsTable"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="4">
                Unable to load notifications.
                ${escapeHtml(message || "")}
            </td>
        </tr>
    `;
}


// ============================================================
// RENDER NOTIFICATIONS
// ============================================================

function renderNotifications(
    notifications
) {

    const tableBody =
        document.getElementById(
            "notificationsTable"
        );

    if (!tableBody) {
        return;
    }

    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No notifications found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        notifications
            .map(
                notification =>
                    createNotificationRow(
                        notification
                    )
            )
            .join("");

    attachNotificationEvents();
}


// ============================================================
// CREATE NOTIFICATION ROW
// ============================================================

function createNotificationRow(
    notification
) {

    const notificationId =
        notification.notificationId;

    const date =
        formatNotificationDate(
            notification.createdAt
        );

    const title =
        notification.title ||
        "Notification";

    const message =
        notification.message ||
        "";

    const status =
        notification.status ||
        (
            notification.isRead
                ? "Read"
                : "New"
        );

    const isRead =
        Boolean(notification.isRead);

    const statusClass =
        isRead
            ? "read"
            : "approved";

    return `
        <tr
            data-notification-id="${escapeHtml(
                String(notificationId)
            )}"
            class="${
                isRead
                    ? "notification-read"
                    : "notification-unread"
            }"
        >

            <td>
                ${escapeHtml(date)}
            </td>

            <td>
                <strong>
                    ${escapeHtml(title)}
                </strong>

                <br>

                <span>
                    ${escapeHtml(message)}
                </span>
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>

                ${
                    isRead
                        ? `
                            <span>
                                Read
                            </span>
                          `
                        : `
                            <button
                                type="button"
                                class="btn secondary notification-read-btn"
                                data-notification-id="${escapeHtml(
                                    String(notificationId)
                                )}"
                            >
                                Mark Read
                            </button>
                          `
                }

            </td>

        </tr>
    `;
}


// ============================================================
// NOTIFICATION EVENTS
// ============================================================

function attachNotificationEvents() {

    document
        .querySelectorAll(
            ".notification-read-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const notificationId =
                        button.dataset.notificationId;

                    await markNotificationRead(
                        notificationId
                    );
                }
            );
        });
}


// ============================================================
// MARK ONE AS READ
// ============================================================

async function markNotificationRead(
    notificationId
) {

    try {

        await markWorkerNotificationAsRead(
            notificationId
        );

        showToast(
            "Notification marked as read."
        );

        await initializeNotifications();

    } catch (error) {

        console.error(
            "Failed to mark notification as read:",
            error
        );

        showToast(
            "Could not mark notification as read."
        );
    }
}


// ============================================================
// MARK ALL AS READ
// ============================================================

function initializeMarkAllRead() {

    const button =
        document.getElementById(
            "markAllReadBtn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {

            try {

                await markAllWorkerNotificationsAsRead();

                showToast(
                    "All notifications marked as read."
                );

                await initializeNotifications();

            } catch (error) {

                console.error(
                    "Failed to mark notifications as read:",
                    error
                );

                showToast(
                    "Could not mark notifications as read."
                );
            }
        }
    );
}


// ============================================================
// NOTIFICATION COUNT
// ============================================================

function updateNotificationCount(
    notifications
) {

    const unreadCount =
        notifications.filter(
            notification =>
                !Boolean(
                    notification.isRead
                )
        ).length;

    const countElement =
        document.getElementById(
            "notificationCount"
        );

    if (!countElement) {
        return;
    }

    if (unreadCount > 0) {

        countElement.textContent =
            unreadCount;

        countElement.hidden =
            false;

    } else {

        countElement.textContent =
            "";

        countElement.hidden =
            true;
    }
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatNotificationDate(
    dateValue
) {

    if (!dateValue) {
        return "Unknown date";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
    value
) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}