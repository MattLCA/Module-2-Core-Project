// ============================================================
// ModernTech Worker Notifications
// ============================================================
//
// This page loads notifications from the backend.
//
// It does NOT use hardcoded notification data.
//
// Database:
//     notifications
//
// ============================================================

console.log("Worker Notifications JS connected.");

// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Worker Notifications...");

  // --------------------------------------------------------
  // Make sure the worker is logged in.
  // --------------------------------------------------------

  if (typeof requireWorkerLogin !== "function") {
    console.error("requireWorkerLogin() is not available.");

    return;
  }

  if (!requireWorkerLogin()) {
    return;
  }

  // --------------------------------------------------------
  // Set up sidebar.
  // --------------------------------------------------------

  if (typeof initializeSidebar === "function") {
    initializeSidebar();
  }

  // --------------------------------------------------------
  // Mark All Read button.
  // --------------------------------------------------------

  initializeMarkAllRead();

  // --------------------------------------------------------
  // Load notifications.
  // --------------------------------------------------------

  await loadNotifications();
});

// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

async function loadNotifications() {
  try {
    console.log("Loading notifications from API...");

    if (typeof getWorkerNotifications !== "function") {
      throw new Error(
        "getWorkerNotifications() is not available in worker_api.js.",
      );
    }

    const response = await getWorkerNotifications();

    console.log("NOTIFICATIONS API RESPONSE:", response);

    const notifications = extractNotificationArray(response);

    console.log("Notifications returned:", notifications);

    renderNotifications(notifications);
  } catch (error) {
    console.error("Could not load notifications:", error);

    renderNotificationError(error.message || "Could not load notifications.");
  }
}

// ============================================================
// EXTRACT NOTIFICATION ARRAY
// ============================================================

function extractNotificationArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  return [];
}

// ============================================================
// RENDER NOTIFICATIONS
// ============================================================

function renderNotifications(notifications) {
  const table = document.getElementById("notificationTable");

  if (!table) {
    return;
  }

  if (!Array.isArray(notifications)) {
    notifications = [];
  }

  // --------------------------------------------------------
  // Calculate counts.
  // --------------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification),
  ).length;

  const totalCount = notifications.length;

  setText("unreadNotificationCount", unreadCount);

  setText("totalNotificationCount", totalCount);

  updateNotificationBadge(unreadCount);

  // --------------------------------------------------------
  // No notifications.
  // --------------------------------------------------------

  if (notifications.length === 0) {
    table.innerHTML = `
            <tr>
                <td colspan="3">
                    You have no notifications.
                </td>
            </tr>
        `;

    return;
  }

  // --------------------------------------------------------
  // Sort newest first.
  // --------------------------------------------------------

  notifications.sort((a, b) => {
    const dateA = getNotificationDate(a);

    const dateB = getNotificationDate(b);

    return dateB - dateA;
  });

  // --------------------------------------------------------
  // Build table rows.
  // --------------------------------------------------------

  table.innerHTML = notifications
    .map((notification) => {
      const read = isNotificationRead(notification);

      const title = notification.title ?? "Notification";

      const message = notification.message ?? "";

      const date = formatNotificationDate(
        getNotificationDateValue(notification),
      );

      const statusText = read ? "Read" : "New";

      const statusClass = read ? "approved" : "pending";

      const rowClass = read ? "notification-read" : "notification-unread";

      return `
                        <tr class="${rowClass}">

                            <td class="notification-date">
                                ${escapeHTML(date)}
                            </td>

                            <td class="notification-message">

                                <strong>
                                    ${escapeHTML(title)}
                                </strong>

                                <br>

                                ${escapeHTML(message)}

                            </td>

                            <td>

                                <span class="status ${statusClass}">
                                    ${statusText}
                                </span>

                            </td>

                        </tr>
                    `;
    })
    .join("");
}

// ============================================================
// MARK ALL READ
// ============================================================

function initializeMarkAllRead() {
  const button = document.getElementById("markAllReadBtn");

  if (!button) {
    return;
  }

  button.addEventListener("click", markAllNotificationsRead);
}

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

async function markAllNotificationsRead() {
  const button = document.getElementById("markAllReadBtn");

  if (!button) {
    return;
  }

  try {
    button.disabled = true;

    button.innerHTML = `
            <i
                class="ti ti-loader-2"
                aria-hidden="true"
            ></i>

            Updating...
        `;

    if (typeof markAllWorkerNotificationsRead !== "function") {
      throw new Error(
        "markAllWorkerNotificationsRead() is not available in worker_api.js.",
      );
    }

    const response = await markAllWorkerNotificationsAsRead();

    console.log("MARK ALL READ RESPONSE:", response);

    showToast(response?.message || "All notifications marked as read.");

    // --------------------------------------------------------
    // Reload from database so the UI reflects the actual
    // database values.
    // --------------------------------------------------------

    await loadNotifications();
  } catch (error) {
    console.error("Could not mark notifications as read:", error);

    showToast(error.message || "Could not update notifications.");
  } finally {
    button.disabled = false;

    button.innerHTML = `
            <i
                class="ti ti-checks"
                aria-hidden="true"
            ></i>

            Mark All Read
        `;
  }
}

// ============================================================
// SIDEBAR BADGE
// ============================================================

function updateNotificationBadge(count) {
  const badge = document.getElementById("notificationBadge");

  if (!badge) {
    return;
  }

  const unread = Number(count);

  if (!Number.isFinite(unread) || unread <= 0) {
    badge.hidden = true;

    badge.textContent = "0";

    return;
  }

  badge.hidden = false;

  badge.textContent = unread > 99 ? "99+" : unread;
}

// ============================================================
// NOTIFICATION READ CHECK
// ============================================================

function isNotificationRead(notification) {
  const value = notification.isRead ?? notification.is_read ?? false;

  return value === true || value === 1 || value === "1";
}

// ============================================================
// GET NOTIFICATION DATE VALUE
// ============================================================

function getNotificationDateValue(notification) {
  return notification.createdAt ?? notification.created_at ?? null;
}

// ============================================================
// GET NOTIFICATION DATE
// ============================================================

function getNotificationDate(notification) {
  const value = getNotificationDateValue(notification);

  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatNotificationDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
}

// ============================================================
// SET TEXT
// ============================================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

// ============================================================
// ERROR STATE
// ============================================================

function renderNotificationError(message) {
  const table = document.getElementById("notificationTable");

  if (table) {
    table.innerHTML = `
            <tr>
                <td colspan="3">
                    Could not load your notifications.
                </td>
            </tr>
        `;
  }

  showToast(message);
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
