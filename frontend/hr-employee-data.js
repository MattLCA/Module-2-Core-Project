const employeeData = {
  "employees": [
    {
      "employeeId": 1,
      "name": "Sibongile Nkosi",
      "position": "Software Engineer",
      "department": "Development",
      "contact": "sibongile.nkosi@moderntech.com",
      "employmentHistory": "Joined in 2015, promoted to Senior in 2018",
      "baseSalary": 70000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Absent"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-22",
          "reason": "Sick Leave",
          "status": "Approved"
        },
        {
          "date": "2024-12-01",
          "reason": "Personal",
          "status": "Pending"
        }
      ],
      "payroll": {
        "hoursWorked": 160,
        "leaveDeductions": 8,
        "finalSalary": 69500
      }
    },
    {
      "employeeId": 2,
      "name": "Lungile Moyo",
      "position": "HR Manager",
      "department": "HR",
      "contact": "lungile.moyo@moderntech.com",
      "employmentHistory": "Joined in 2013, promoted to Manager in 2017",
      "baseSalary": 80000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Absent"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-15",
          "reason": "Family Responsibility",
          "status": "Denied"
        },
        {
          "date": "2024-12-02",
          "reason": "Vacation",
          "status": "Approved"
        }
      ],
      "payroll": {
        "hoursWorked": 150,
        "leaveDeductions": 10,
        "finalSalary": 79000
      }
    },
    {
      "employeeId": 3,
      "name": "Thabo Molefe",
      "position": "Quality Analyst",
      "department": "QA",
      "contact": "thabo.molefe@moderntech.com",
      "employmentHistory": "Joined in 2018",
      "baseSalary": 55000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Absent"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-10",
          "reason": "Medical Appointment",
          "status": "Approved"
        },
        {
          "date": "2024-12-05",
          "reason": "Personal",
          "status": "Pending"
        }
      ],
      "payroll": {
        "hoursWorked": 170,
        "leaveDeductions": 4,
        "finalSalary": 54800
      }
    },
    {
      "employeeId": 4,
      "name": "Keshav Naidoo",
      "position": "Sales Representative",
      "department": "Sales",
      "contact": "keshav.naidoo@moderntech.com",
      "employmentHistory": "Joined in 2020",
      "baseSalary": 60000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Absent"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-20",
          "reason": "Bereavement",
          "status": "Approved"
        }
      ],
      "payroll": {
        "hoursWorked": 165,
        "leaveDeductions": 6,
        "finalSalary": 59700
      }
    },
    {
      "employeeId": 5,
      "name": "Zanele Khumalo",
      "position": "Marketing Specialist",
      "department": "Marketing",
      "contact": "zanele.khumalo@moderntech.com",
      "employmentHistory": "Joined in 2019",
      "baseSalary": 58000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Absent"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2024-12-01",
          "reason": "Childcare",
          "status": "Pending"
        }
      ],
      "payroll": {
        "hoursWorked": 158,
        "leaveDeductions": 5,
        "finalSalary": 57850
      }
    },
    {
      "employeeId": 6,
      "name": "Sipho Zulu",
      "position": "UI/UX Designer",
      "department": "Design",
      "contact": "sipho.zulu@moderntech.com",
      "employmentHistory": "Joined in 2016",
      "baseSalary": 65000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Absent"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-18",
          "reason": "Sick Leave",
          "status": "Approved"
        }
      ],
      "payroll": {
        "hoursWorked": 168,
        "leaveDeductions": 2,
        "finalSalary": 64800
      }
    },
    {
      "employeeId": 7,
      "name": "Naledi Moeketsi",
      "position": "DevOps Engineer",
      "department": "IT",
      "contact": "naledi.moeketsi@moderntech.com",
      "employmentHistory": "Joined in 2017",
      "baseSalary": 72000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Absent"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-22",
          "reason": "Vacation",
          "status": "Pending"
        }
      ],
      "payroll": {
        "hoursWorked": 175,
        "leaveDeductions": 3,
        "finalSalary": 71800
      }
    },
    {
      "employeeId": 8,
      "name": "Farai Gumbo",
      "position": "Content Strategist",
      "department": "Marketing",
      "contact": "farai.gumbo@moderntech.com",
      "employmentHistory": "Joined in 2021",
      "baseSalary": 56000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Absent"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2024-12-02",
          "reason": "Medical Appointment",
          "status": "Approved"
        }
      ],
      "payroll": {
        "hoursWorked": 160,
        "leaveDeductions": 0,
        "finalSalary": 56000
      }
    },
    {
      "employeeId": 9,
      "name": "Karabo Dlamini",
      "position": "Accountant",
      "department": "Finance",
      "contact": "karabo.dlamini@moderntech.com",
      "employmentHistory": "Joined in 2018",
      "baseSalary": 62000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Present"
        },
        {
          "date": "2025-07-28",
          "status": "Absent"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2025-07-19",
          "reason": "Childcare",
          "status": "Denied"
        }
      ],
      "payroll": {
        "hoursWorked": 155,
        "leaveDeductions": 5,
        "finalSalary": 61500
      }
    },
    {
      "employeeId": 10,
      "name": "Fatima Patel",
      "position": "Customer Support Lead",
      "department": "Support",
      "contact": "fatima.patel@moderntech.com",
      "employmentHistory": "Joined in 2016",
      "baseSalary": 58000,
      "attendance": [
        {
          "date": "2025-07-25",
          "status": "Present"
        },
        {
          "date": "2025-07-26",
          "status": "Present"
        },
        {
          "date": "2025-07-27",
          "status": "Absent"
        },
        {
          "date": "2025-07-28",
          "status": "Present"
        },
        {
          "date": "2025-07-29",
          "status": "Present"
        }
      ],
      "leaveRequests": [
        {
          "date": "2024-12-03",
          "reason": "Vacation",
          "status": "Pending"
        }
      ],
      "payroll": {
        "hoursWorked": 162,
        "leaveDeductions": 4,
        "finalSalary": 57750
      }
    }
  ]
};