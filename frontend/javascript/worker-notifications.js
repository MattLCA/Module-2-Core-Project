// ============================================================
// ModernTech Worker Notifications
// ============================================================

console.log("Worker Notifications JS connected.");

// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Worker Notifications...");

  // --------------------------------------------------------
  // Check login
  // --------------------------------------------------------

  if (typeof requireWorkerLogin !== "function") {
    console.error("requireWorkerLogin() is not available.");

    return;
  }

  if (!requireWorkerLogin()) {
    return;
  }

  // --------------------------------------------------------
  // Sidebar
  // --------------------------------------------------------

  if (typeof initializeSidebar === "function") {
    initializeSidebar();
  }

  // --------------------------------------------------------
  // Mark All Read
  // --------------------------------------------------------

  initializeMarkAllRead();

  // --------------------------------------------------------
  // Load notifications
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
  // Sort newest first
  // --------------------------------------------------------

  notifications.sort((a, b) => {
    return getNotificationDate(b) - getNotificationDate(a);
  });

  // --------------------------------------------------------
  // Counts
  // --------------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification),
  ).length;

  setText("unreadNotificationCount", unreadCount);

  setText("totalNotificationCount", notifications.length);

  updateNotificationBadge(unreadCount);

  // --------------------------------------------------------
  // No notifications
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
  // Build rows
  // --------------------------------------------------------

  table.innerHTML = notifications
    .map((notification) => {
      const read = isNotificationRead(notification);

      const notificationId =
        notification.notificationId ?? notification.notification_id;

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

                            ${
                              !read && notificationId
                                ? `
                                        <button
                                            type="button"
                                            class="btn secondary notification-read-btn"
                                            data-notification-id="${escapeHTML(notificationId)}"
                                        >

                                            <i
                                                class="ti ti-check"
                                                aria-hidden="true"
                                            ></i>

                                            Mark Read

                                        </button>
                                    `
                                : ""
                            }

                        </td>

                    </tr>
                `;
    })
    .join("");

  // --------------------------------------------------------
  // Connect individual buttons
  // --------------------------------------------------------

  initializeIndividualReadButtons();
}

// ============================================================
// INDIVIDUAL MARK READ BUTTONS
// ============================================================

function initializeIndividualReadButtons() {
  const buttons = document.querySelectorAll(".notification-read-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const notificationId = button.dataset.notificationId;

      if (!notificationId) {
        showToast("Could not identify the notification.");

        return;
      }

      await markNotificationAsRead(notificationId, button);
    });
  });
}

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

async function markNotificationAsRead(notificationId, button) {
  try {
    button.disabled = true;

    button.innerHTML = `
            <i
                class="ti ti-loader-2"
                aria-hidden="true"
            ></i>

            Updating...
        `;

    if (typeof markWorkerNotificationAsRead !== "function") {
      throw new Error("markWorkerNotificationAsRead() is not available.");
    }

    const response = await markWorkerNotificationAsRead(notificationId);

    console.log("MARK NOTIFICATION READ RESPONSE:", response);

    showToast(response?.message || "Notification marked as read.");

    // Reload from the database.

    await loadNotifications();
  } catch (error) {
    console.error("Could not mark notification as read:", error);

    showToast(error.message || "Could not mark notification as read.");

    button.disabled = false;

    button.innerHTML = `
            <i
                class="ti ti-check"
                aria-hidden="true"
            ></i>

            Mark Read
        `;
  }
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

    if (typeof markAllWorkerNotificationsAsRead !== "function") {
      throw new Error("markAllWorkerNotificationsAsRead() is not available.");
    }

    const response = await markAllWorkerNotificationsAsRead();

    console.log("MARK ALL READ RESPONSE:", response);

    showToast(response?.message || "All notifications marked as read.");

    await loadNotifications();
  } catch (error) {
    console.error("Could not mark all notifications as read:", error);

    showToast(error.message || "Could not mark notifications as read.");
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
// NOTIFICATION BADGE
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

  badge.textContent = unread > 99 ? "99+" : String(unread);
}

// ============================================================
// CHECK READ STATUS
// ============================================================

function isNotificationRead(notification) {
  const value = notification.isRead ?? notification.is_read ?? false;

  return value === true || value === 1 || value === "1";
}

// ============================================================
// GET DATE VALUE
// ============================================================

function getNotificationDateValue(notification) {
  return notification.createdAt ?? notification.created_at ?? null;
}

// ============================================================
// GET DATE
// ============================================================

function getNotificationDate(notification) {
  const value = getNotificationDateValue(notification);

  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
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
// ERROR
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
