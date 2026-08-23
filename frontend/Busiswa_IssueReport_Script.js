document.addEventListener("DOMContentLoaded", () => {
  const reportForm = document.getElementById("issueReportForm");
  const issueCategory = document.getElementById("issueCategory");
  const issuePriority = document.getElementById("issuePriority");
  const issueDepartment = document.getElementById("issueDepartment");
  const issueSubject = document.getElementById("issueSubject");
  const issueDescription = document.getElementById("issueDescription");
  const submitAnonymous = document.getElementById("submitAnonymous");

  const submittedCount = document.getElementById("submittedCount");
  const reviewCount = document.getElementById("reviewCount");
  const inProgressSummary = document.getElementById("inProgressSummary");
  const resolvedSummary = document.getElementById("resolvedSummary");

  const donutChart = document.getElementById("donutChart");
  const donutTotal = document.getElementById("donutTotal");
  const legendResolved = document.getElementById("legendResolved");
  const legendProgress = document.getElementById("legendProgress");
  const legendReview = document.getElementById("legendReview");

  const reportsTableBody = document.getElementById("reportsTableBody");
  const timelineList = document.getElementById("timelineList");

  const seedIssues = [
    {
      reference: "HR-041",
      title: "hi",
      description: "No description provided.",
      category: "Workplace Safety",
      priority: "Low",
      department: "Engineering",
      reporter: "Anonymous",
      status: "Resolved",
      createdAt: "2026-07-03T09:00:00.000Z",
      submittedAt: "03 Jul",
    },
    {
      reference: "HR-042",
      title: "Urgent",
      description: "No description provided.",
      category: "Harassment",
      priority: "Critical",
      department: "Engineering",
      reporter: "Anonymous",
      status: "Under Review",
      createdAt: "2026-07-03T10:00:00.000Z",
      submittedAt: "03 Jul",
    },
    {
      reference: "HR-043",
      title: "hi",
      description: "No description provided.",
      category: "Workplace Safety",
      priority: "Low",
      department: "Engineering",
      reporter: "Anonymous",
      status: "Resolved",
      createdAt: "2026-07-03T11:00:00.000Z",
      submittedAt: "03 Jul",
    },
    {
      reference: "HR-044",
      title: "Verbal Abuse",
      description: "No description provided.",
      category: "Other",
      priority: "Medium",
      department: "Customer Success",
      reporter: "Anonymous",
      status: "In Progress",
      createdAt: "2026-07-03T12:00:00.000Z",
      submittedAt: "03 Jul",
    },
    {
      reference: "HR-045",
      title: "unattended cables",
      description: "No description provided.",
      category: "Workplace Safety",
      priority: "Medium",
      department: "IT",
      reporter: "Anonymous",
      status: "In Progress",
      createdAt: "2026-07-07T09:00:00.000Z",
      submittedAt: "07 Jul",
    },
  ];

  const storedData = localStorage.getItem("bs_issues_data");
  let issues = storedData ? JSON.parse(storedData) : seedIssues;

  function saveIssues() {
    localStorage.setItem("bs_issues_data", JSON.stringify(issues));
  }

  function getStatusCounts() {
    return {
      submitted: issues.length,
      review: issues.filter((item) => item.status === "Under Review").length,
      inProgress: issues.filter((item) => item.status === "In Progress").length,
      resolved: issues.filter((item) => item.status === "Resolved").length,
    };
  }

  function getStatusBadgeClass(status) {
    if (status === "Under Review") return "review";
    if (status === "In Progress") return "progress";
    return "resolved";
  }

  function createTimelineItem(item) {
    const row = document.createElement("div");
    row.className = "timeline-item";
    row.innerHTML = `
      <div class="timeline-step">
        <span class="timeline-dot ${item.dot}"></span>
        <div class="timeline-title">${item.event}</div>
        <div class="timeline-time">${item.time}</div>
        <div class="timeline-detail">${item.detail}</div>
      </div>
    `;
    return row;
  }

  function renderDashboard() {
    const counts = getStatusCounts();

    submittedCount.textContent = counts.submitted;
    reviewCount.textContent = counts.review;
    inProgressSummary.textContent = counts.inProgress;
    resolvedSummary.textContent = counts.resolved;

    const total = counts.submitted || 1;
    const resolvedEnd = (counts.resolved / total) * 100;
    const progressEnd = resolvedEnd + (counts.inProgress / total) * 100;
    const reviewEnd = progressEnd + (counts.review / total) * 100;

    donutChart.style.background = `conic-gradient(#3ecf8e 0 ${resolvedEnd}%, #758bfd ${resolvedEnd}% ${progressEnd}%, #ff9f43 ${progressEnd}% ${reviewEnd}%, #e7e7f4 ${reviewEnd}% 100%)`;

    donutTotal.textContent = counts.submitted;
    legendResolved.textContent = counts.resolved;
    legendProgress.textContent = counts.inProgress;
    legendReview.textContent = counts.review;

    // Populate reports table
    reportsTableBody.innerHTML = "";
    issues.forEach((issue) => {
      const row = document.createElement("tr");
      const statusBadgeClass = getStatusBadgeClass(issue.status);
      row.innerHTML = `
        <td>${issue.reference}</td>
        <td>${issue.title}</td>
        <td>${issue.category}</td>
        <td>${issue.department}</td>
        <td><span class="status-pill ${issue.priority.toLowerCase()}">${issue.priority}</span></td>
        <td><span class="status-pill ${statusBadgeClass}">${issue.status}</span></td>
        <td>${issue.submittedAt}</td>
      `;
      reportsTableBody.appendChild(row);
    });

    const timelineItems = [...issues]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((issue) => ({
        event: issue.title,
        time: issue.submittedAt,
        detail: `${issue.priority} priority · ${issue.department}`,
        status: issue.status,
        dot:
          issue.status === "Resolved"
            ? "resolved"
            : issue.status === "In Progress"
              ? "progress"
              : "review",
      }));

    timelineList.innerHTML = "";
    timelineItems.forEach((item) =>
      timelineList.appendChild(createTimelineItem(item)),
    );
  }

  function createIssueReference() {
    const prefix = "HR";
    const number = String(41 + issues.length).padStart(3, "0");
    return `${prefix}-${number}`;
  }

  function getStatusFromPriority(priority) {
    if (priority === "Critical" || priority === "High") return "Under Review";
    if (priority === "Medium") return "In Progress";
    return "Resolved";
  }

  reportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newIssue = {
      reference: createIssueReference(),
      title: issueSubject.value.trim() || "Issue report",
      description: issueDescription.value.trim() || "No description provided.",
      category: issueCategory.value,
      priority: issuePriority.value,
      department: issueDepartment.value,
      reporter: submitAnonymous.checked ? "Anonymous" : "Priya Sharma",
      status: getStatusFromPriority(issuePriority.value),
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };

    issues.unshift(newIssue);
    saveIssues();
    renderDashboard();

    reportForm.reset();
    issueCategory.value = "Workplace Safety";
    issuePriority.value = "Low";
    issueDepartment.value = "Engineering";
  });

  renderDashboard();
});
