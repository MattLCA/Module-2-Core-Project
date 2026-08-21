// ============================================================
// ModernTech Worker Notifications
// ============================================================

console.log(
    "Worker Notifications JS connected."
);


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            typeof requireWorkerLogin === "function" &&
            !requireWorkerLogin()
        ) {
            return;
        }


        await loadNotifications();

        await loadUnreadCount();

        initializeNotificationEvents();

    }
);


// ============================================================
// LOAD
// ============================================================

async function loadNotifications() {

    try {

        const response =
            await getWorkerNotifications();


        const notifications =
            response?.data ||
            [];


        renderNotifications(
            notifications
        );


    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );


        renderNotificationError(
            error.message
        );

    }

}


// ============================================================
// UNREAD COUNT
// ============================================================

async function loadUnreadCount() {

    try {

        const response =
            await getUnreadWorkerNotificationCount();


        const count =
            Number(
                response?.data?.count ??
                response?.count ??
                response?.data ??
                response?.unreadCount ??
                0
            );


        updateNotificationBadges(
            count
        );


    } catch (error) {

        console.error(
            "Unread count error:",
            error
        );

    }

}


// ============================================================
// RENDER
// ============================================================

function renderNotifications(
    notifications
) {

    const container =
        document.getElementById(
            "notificationsList"
        ) ||
        document.getElementById(
            "notificationList"
        ) ||
        document.getElementById(
            "notificationsContainer"
        );


    if (!container) {

        console.error(
            "Notifications container not found."
        );

        return;

    }


    if (!notifications.length) {

        container.innerHTML = `
            <div class="notification-empty">

                <i class="ti ti-bell-off"></i>

                <h3>
                    No notifications
                </h3>

                <p>
                    You don't have any notifications right now.
                </p>

            </div>
        `;

        return;

    }


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
// NOTIFICATION HTML
// ============================================================

function createNotificationHTML(
    notification
) {

    const id =
        notification.notificationId ??
        notification.notification_id ??
        notification.id;


    const title =
        notification.title ||
        "Notification";


    const message =
        notification.message ||
        "";


    const createdAt =
        notification.createdAt ??
        notification.created_at;


    // IMPORTANT:
    //
    // MySQL TINYINT(1) normally comes through as:
    //
    // 0 = false
    // 1 = true
    //
    // Therefore use Number().
    //

    const isRead =
        Number(
            notification.isRead ??
            notification.is_read ??
            0
        ) === 1;


    return `
        <article
            class="notification-item ${
                isRead ? "" : "unread"
            }"
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
                        ${escapeHTML(
                            formatNotificationDate(
                                createdAt
                            )
                        )}
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
// EVENTS
// ============================================================

function initializeNotificationEvents() {

    const container =
        document.getElementById(
            "notificationsList"
        ) ||
        document.getElementById(
            "notificationList"
        ) ||
        document.getElementById(
            "notificationsContainer"
        );


    const markAll =
        document.getElementById(
            "markAllReadBtn"
        );


    if (markAll) {

        markAll.addEventListener(
            "click",
            markAllNotificationsRead
        );

    }


    if (!container) {
        return;
    }


    container.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    "[data-action='mark-read']"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            if (!id) {
                return;
            }


            await markNotificationRead(
                id
            );

        }
    );

}


// ============================================================
// MARK ONE READ
// ============================================================

async function markNotificationRead(
    notificationId
) {

    try {

        await markWorkerNotificationAsRead(
            notificationId
        );


        await loadNotifications();

        await loadUnreadCount();


        showToast(
            "Notification marked as read."
        );


    } catch (error) {

        console.error(
            "Mark read error:",
            error
        );


        showToast(
            error.message ||
            "Could not mark notification as read."
        );

    }

}


// ============================================================
// MARK ALL READ
// ============================================================

async function markAllNotificationsRead() {

    try {

        await markAllWorkerNotificationsAsRead();


        await loadNotifications();

        await loadUnreadCount();


        showToast(
            "All notifications marked as read."
        );


    } catch (error) {

        console.error(
            "Mark all read error:",
            error
        );


        showToast(
            error.message ||
            "Could not mark notifications as read."
        );

    }

}


// ============================================================
// BADGES
// ============================================================

function updateNotificationBadges(
    count
) {

    const numericCount =
        Number(count) || 0;


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


    badges.forEach(
        badge => {

            badge.textContent =
                numericCount > 99
                    ? "99+"
                    : String(
                        numericCount
                    );


            badge.hidden =
                numericCount === 0;

        }
    );


    const notificationLink =
        document.querySelector(
            'a[href="worker-notifications.html"]'
        );


    if (!notificationLink) {
        return;
    }


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
                : String(
                    numericCount
                );

    } else if (badge) {

        badge.remove();

    }

}


// ============================================================
// DATE
// ============================================================

function formatNotificationDate(
    value
) {

    if (!value) {
        return "Recently";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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
// ERROR
// ============================================================

function renderNotificationError(
    message
) {

    const container =
        document.getElementById(
            "notificationsList"
        ) ||
        document.getElementById(
            "notificationList"
        ) ||
        document.getElementById(
            "notificationsContainer"
        );


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
                ${escapeHTML(
                    message ||
                    "Unknown error."
                )}
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


    document
        .getElementById(
            "retryNotificationsBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                await loadNotifications();

                await loadUnreadCount();

            }
        );

}


// ============================================================
// ESCAPE
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
// GLOBALS
// ============================================================

window.loadNotifications =
    loadNotifications;

window.loadUnreadCount =
    loadUnreadCount;

window.updateNotificationBadges =
    updateNotificationBadges;

window.markNotificationRead =
    markNotificationRead;

window.markAllNotificationsRead =
    markAllNotificationsRead;