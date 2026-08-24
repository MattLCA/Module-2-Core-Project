// ============================================================
// ModernTech Shared Notification Bell
// ============================================================
//
// Included on any page with the standard #notifBtn / #notifPanel /
// #notifList / #notifDot / #notifMarkAllBtn markup. Loads real
// notifications from GET /api/notifications and wires "Mark all
// read" to PATCH /api/notifications/read-all.
//
// Each page keeps its own open/close toggle logic for the panel —
// this file only owns fetching, rendering, and marking as read.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const notifList = document.getElementById("notifList");
    const notifDot = document.getElementById("notifDot");
    const notifMarkAllBtn = document.getElementById("notifMarkAllBtn");

    if (!notifList) {
        // This page doesn't have the notification bell markup.
        return;
    }

    const ICONS_BY_TYPE = {
        leave: "ti-beach",
        payroll: "ti-cash",
        performance: "ti-star",
        goal: "ti-target",
        general: "ti-bell"
    };

    function iconFor(type) {
        return ICONS_BY_TYPE[type] || "ti-bell";
    }

    function timeAgo(isoString) {
        const then = new Date(isoString).getTime();
        const now = Date.now();

        if (Number.isNaN(then)) return "";

        const diffMs = Math.max(0, now - then);
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;

        return new Date(isoString).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit"
        });
    }

    function renderNotifications(notifications) {
        if (!notifications.length) {
            notifList.innerHTML = `
                <li class="notif-item">
                    <i class="ti ti-bell-off" aria-hidden="true"></i>
                    <div><p>You're all caught up.</p><span>No notifications</span></div>
                </li>
            `;
            return;
        }

        notifList.innerHTML = notifications
            .map(n => `
                <li class="notif-item${n.isRead ? "" : " unread"}" data-id="${n.notificationId}">
                    <i class="ti ${iconFor(n.notificationType)}" aria-hidden="true"></i>
                    <div><p>${n.message}</p><span>${timeAgo(n.createdAt)}</span></div>
                </li>
            `)
            .join("");
    }

    function updateDot(notifications) {
        if (!notifDot) return;
        const hasUnread = notifications.some(n => !n.isRead);
        notifDot.style.display = hasUnread ? "" : "none";
    }

    async function loadNotifications() {
        try {
            const result = await apiFetch("/notifications");
            const notifications = result.data || [];
            renderNotifications(notifications);
            updateDot(notifications);
        } catch (error) {
            notifList.innerHTML = `
                <li class="notif-item">
                    <div><p>Couldn\u2019t load notifications.</p><span>${error.message}</span></div>
                </li>
            `;
        }
    }

    // Clicking an unread item marks just that one as read.
    notifList.addEventListener("click", async (e) => {
        const item = e.target.closest(".notif-item.unread");
        if (!item || !item.dataset.id) return;

        item.classList.remove("unread");

        try {
            await apiFetch(`/notifications/${item.dataset.id}/read`, {
                method: "PATCH"
            });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }

        const anyUnread = notifList.querySelector(".notif-item.unread");
        if (notifDot && !anyUnread) notifDot.style.display = "none";
    });

    if (notifMarkAllBtn) {
        notifMarkAllBtn.addEventListener("click", async () => {
            try {
                await apiFetch("/notifications/read-all", {
                    method: "PATCH"
                });
                notifList.querySelectorAll(".notif-item.unread")
                    .forEach(item => item.classList.remove("unread"));
                if (notifDot) notifDot.style.display = "none";
                if (typeof showToast === "function") {
                    showToast("All notifications marked as read.");
                }
            } catch (error) {
                if (typeof showToast === "function") {
                    showToast("Failed to mark notifications as read.");
                }
            }
        });
    }

    loadNotifications();
});