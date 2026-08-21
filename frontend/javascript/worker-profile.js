console.log("Employee Information JS file is connected");

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".emp-profile-tab");
  const contents = document.querySelectorAll(".emp-profile-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((button) => button.classList.remove("active"));

      contents.forEach((content) => content.classList.remove("active"));

      tab.classList.add("active");

      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
});

fetch("data/employee_info.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("JSON could not be loaded.");
    }

    return response.json();
  })
  .then((data) => {
    console.log(data);

    const employee = data.employeeInformation.find(
      (emp) => emp.employeeId === 1,
    );

    document.getElementById("empName").textContent = employee.name;
    document.getElementById("empID").textContent = employee.employeeId;
    document.getElementById("empDepartment").textContent = employee.department;
    document.getElementById("empPosition").textContent = employee.position;
    document.getElementById("empEmail").textContent = employee.contact;
    document.getElementById("empSalary").textContent =
      "R " + employee.salary.toLocaleString();
    document.getElementById("empHistory").textContent =
      employee.employmentHistory;
    document.getElementById("empDepartmentHistory").textContent =
      employee.department;
    document.getElementById("empPositionHistory").textContent =
      employee.position;
  })
  .catch((error) => {
    console.error(error);
  });
