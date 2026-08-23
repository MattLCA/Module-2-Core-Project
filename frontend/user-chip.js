// Fills in the sidebar user chip (avatar initials, name, role) and any
// greeting heading using the real logged-in user, instead of hardcoded
// placeholder names left over from the design mockups.
//
// Include this AFTER api.js and AFTER the page has already parsed
// loggedInUser from localStorage (or it will parse its own copy).

(function () {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null",
  );

  if (!loggedInUser) return;

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  }

  const chip = document.querySelector(".user-chip");

  if (chip) {
    const avatarEl = chip.querySelector(".avatar");
    const nameEl = chip.querySelector(".name");
    const roleEl = chip.querySelector(".role");

    if (loggedInUser.name) {
      if (nameEl) nameEl.textContent = loggedInUser.name;
      if (avatarEl) avatarEl.textContent = initials(loggedInUser.name);
    }

    if (roleEl) {
      // Worker pages currently show an employee code (e.g. "EMP-001")
      // in this spot instead of a role label. Prefer employeeCode if
      // the backend provided one; otherwise fall back to a role label.
      roleEl.textContent = loggedInUser.employeeCode
        ? loggedInUser.employeeCode
        : loggedInUser.role === "hr"
          ? "HR Manager"
          : "Employee";
    }
  }

  // Optional: any heading with data-greeting="true" gets "Good
  // morning/afternoon/evening, <FirstName>" filled in automatically.
  const greetingEl = document.querySelector("[data-greeting]");

  if (greetingEl && loggedInUser.name) {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    const firstName = loggedInUser.name.split(" ")[0];
    greetingEl.textContent = `${greeting}, ${firstName}`;
  }

  // worker-dashboard.html's "Welcome back, <name>" line
  const welcomeNameEl = document.getElementById("welcomeName");

  if (welcomeNameEl && loggedInUser.name) {
    welcomeNameEl.textContent = loggedInUser.name.split(" ")[0];
  }
})();
