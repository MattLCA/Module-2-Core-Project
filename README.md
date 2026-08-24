# ModernTech HR Management System

A full-stack Human Resources Management System developed for ModernTech Solutions. The application provides separate interfaces for HR administrators and employees, with a Node.js/Express REST API connected to a MySQL relational database.

The system manages core HR processes including employee management, authentication, attendance, leave, payroll, performance management, time-off requests, issue reporting and employee self-service.

---

## 📌 Project Overview

The ModernTech HR Management System centralises employee and HR operations into one web application.

### HR Administration

HR users can manage:

- Employee records
- HR dashboard information
- Payroll
- Performance and goals
- Attendance
- Leave requests
- Time-off requests
- Employee issue reports

### Employee / Worker Portal

Employees can access:

- Personal dashboard
- Employee profile
- Attendance
- Leave information
- Payslips
- Notifications

The application uses role-based authorization to ensure HR users and employees only access functionality appropriate to their roles.

---

## 🛠️ Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Responsive Web Design

### Backend

- Node.js
- Express.js
- MySQL
- mysql2
- RESTful API architecture
- MVC-style separation of routes, controllers and data access

### Security

- JSON Web Tokens (JWT)
- bcrypt
- Helmet
- CORS
- Express Validator
- Role-based authorization

### Additional Libraries

- PDFKit
- Nodemon

---

## 🏗️ Project Structure

```
Module-2-Core-Project/
│
├── frontend/
│   ├── HTML pages
│   ├── CSS
│   ├── JavaScript
│   ├── API integration
│   └── JSON development data
│
├── backend/
│   ├── moderntech_db.sql
│   ├── package.json
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── index.js
│
└── README.md
```

The backend follows a modular architecture where routes handle HTTP requests, controllers contain application logic, middleware handles authentication and validation, and database access is separated from the request-handling layer.

---

## 👥 Team Contributions

The project was developed collaboratively by Matthew, Busiswa and Angela. Each team member was responsible for a specific feature domain while contributing to the final integrated application.

### 👨‍💻 Matthew — Authentication & HR Administration

Matthew was responsible for the application's authentication system and core HR administration features.

#### 🔐 Authentication & Authorization

Matthew implemented the authentication and authorization layer using bcrypt and JWT.

His work included:

- HR and worker login functionality
- Authentication using HR email addresses or employee IDs
- Password verification using bcrypt
- JWT token generation
- JWT verification middleware
- Role-based authorization for HR and workers
- Protected API routes
- Login validation using Express Validator
- Secure authentication error handling

The authentication flow is:

```
Login Request
     ↓
Input Validation
     ↓
Find Employee
     ↓
bcrypt Password Verification
     ↓
Generate JWT
     ↓
Authenticated Request
     ↓
JWT Verification
     ↓
Role Authorization
     ↓
Protected Resource
```

This authentication system provides the security foundation for both the HR and employee portals.

#### 📊 HR Dashboard

Matthew developed the HR Dashboard, providing HR users with an overview of organisational information.

This included:

- Dashboard statistics
- Employee information summaries
- HR data visualisation
- API integration
- Dynamic data rendering
- Authenticated HR access

#### 👥 HR Employee Management

Matthew developed the HR Employee Management module, including the employee directory and employee information interface.

The module retrieves employee records through the REST API and displays information such as:

- Employee ID
- Name
- Department
- Position
- Employment information
- Contact information

#### 💰 HR Payroll

Matthew developed the HR Payroll module, providing HR users with access to employee payroll information.

This included:

- Payroll tables
- Employee payroll records
- Salary information
- API integration
- Dynamic payroll rendering
- Authenticated HR access

#### 📈 HR Performance & Goals

Matthew developed the Performance Management and Goals modules.

These features allow HR users to monitor employee performance and manage performance goals through:

- Performance records
- Performance indicators
- Employee goals
- Goal progress
- Performance-related API integration
- Dynamic rendering of performance data

#### Matthew's Main Contributions

| Feature | Contribution |
|---|---|
| Authentication | Login, bcrypt, JWT |
| Authorization | JWT verification and role-based access |
| HR Dashboard | Dashboard UI and API integration |
| HR Employees | Employee directory and management |
| HR Payroll | Payroll management and data rendering |
| Performance | Performance management |
| Goals | Employee performance goals |

---

### 👩‍💻 Busiswa — HR Operations

Busiswa was responsible for the HR operational modules, focusing on employee attendance, leave, time-off and issue reporting.

#### 🕒 Attendance

Busiswa developed the HR Attendance Management module.

The feature allows HR users to monitor employee attendance records through a dynamic interface connected to the backend API.

This included:

- Attendance records
- Attendance status
- Date and time information
- API integration
- Dynamic data rendering
- HR-specific access

#### 🏖️ Leave Management

Busiswa developed the HR Leave Management module.

The module manages employee leave information and requests, including:

- Leave types
- Leave requests
- Leave status
- Employee leave information
- API integration
- Dynamic request rendering

#### ⏱️ Time-Off

Busiswa developed the Time-Off Management module, allowing HR users to manage employee time-off requests.

This included:

- Time-off request interfaces
- Request information
- Request status
- Backend API integration
- Dynamic rendering

#### 🚨 Issue Reporting

Busiswa developed the Issue Reporting module, providing a structured way for employee-related issues to be recorded and managed.

The module includes:

- Issue submission
- Issue records
- Issue status
- API integration
- Dynamic issue rendering

#### Busiswa's Main Contributions

| Feature | Contribution |
|---|---|
| Attendance | Attendance management and API integration |
| Leave | Leave requests and management |
| Time-Off | Employee time-off management |
| Issue Reporting | Issue submission and management |

Busiswa's work forms the main HR operational management layer of the application.

---

### 👩‍💻 Angela — Employee / Worker Portal

Angela was responsible for the complete employee-facing side of the application.

All worker-side features were developed by Angela, providing employees with a self-service portal for accessing their own HR information.

#### 🏠 Worker Dashboard

Angela developed the employee dashboard, providing employees with an overview of their personal HR information.

The dashboard integrates data from the backend and displays employee-specific information such as:

- Employee details
- Attendance
- Leave
- Payroll information
- Notifications

#### 👤 Worker Profile

Angela developed the employee profile page, allowing authenticated workers to view their own:

- Personal information
- Employee information
- Department
- Position
- Contact information

#### 🕒 Worker Attendance

Angela developed the worker-facing attendance feature.

Employees can view their own attendance information through authenticated API requests, ensuring that the interface is based on the currently logged-in employee.

#### 🏖️ Worker Leave

Angela developed the employee leave module, allowing workers to access:

- Leave balances
- Leave requests
- Previous requests
- Request status

#### 💳 Worker Payslip

Angela developed the employee payslip functionality.

The module retrieves authenticated employee payroll information and presents it through a dedicated payslip interface.

#### 🔔 Worker Notifications

Angela developed the worker notification system, allowing employees to view HR and system notifications associated with their account.

#### Angela's Main Contributions

| Feature | Contribution |
|---|---|
| Worker Dashboard | Employee-specific dashboard |
| Worker Profile | Personal and employment information |
| Worker Attendance | Employee attendance history |
| Worker Leave | Leave balances and requests |
| Worker Payslip | Employee payroll information |
| Notifications | Employee notification system |

Angela's work forms the complete employee self-service portal.

---

## 🔗 Team Integration

Although the project was divided into feature areas, all modules were integrated into a single full-stack system.

```
                    ModernTech HR System
                            │
             ┌──────────────┴──────────────┐
             │                             │
      HR Administration             Employee Portal
             │                             │
     ┌───────┴────────┐             ┌──────┴─────────┐
     │                │             │                │
  Matthew          Busiswa        Angela             │
     │                │             │                │
 Authentication   Attendance   Worker Dashboard      │
 HR Dashboard      Leave        Worker Profile       │
 Employees         Time-Off     Worker Attendance    │
 Payroll           Issues       Worker Leave         │
 Performance                    Worker Payslip       │
 Goals                          Notifications         │
     │                │             │
     └────────────────┴─────────────┘
                      │
                      ▼
                Express REST API
                      │
             JWT Authentication
                      │
              Role Authorization
                      │
                      ▼
                 MySQL Database
```

The shared backend allows the frontend modules to communicate through consistent REST API endpoints while authentication and authorization control access to protected resources.

---

## 🔐 Authentication

Authentication is handled through:

- bcrypt password hashing
- JWT access tokens
- Express authentication middleware
- Role-based authorization

Users authenticate through:

```
POST /api/auth/login
```

Example request:

```json
{
  "role": "worker",
  "identifier": "EMP001",
  "password": "your-password"
}
```

HR users authenticate using their email address, while workers use their employee ID/code.

Authenticated requests use:

```
Authorization: Bearer <token>
```

---

## 👥 Role-Based Authorization

The system supports two primary roles:

- `hr`
- `worker`

Protected routes verify the JWT before checking the user's role.

```
Request
   ↓
JWT Authentication
   ↓
User Identity
   ↓
Role Authorization
   ↓
Allowed / Denied
```

This prevents employees from accessing HR-only functionality and limits worker data to the authenticated employee.

---

## 🗄️ Database

The application uses MySQL with the database:

```
moderntech_db
```

The database schema is located at:

```
backend/moderntech_db.sql
```

Major entities include:

- roles
- departments
- positions
- employees
- attendance
- leave_types
- leave_balances
- leave_requests
- payroll
- notifications
- performance_reviews
- goals
- review_cycles
- review_cycle_progress

The database uses primary and foreign keys to establish relationships between employee records and related HR information.

---

## 🔌 API

The backend provides a RESTful API running by default on:

```
http://localhost:4000
```

### Main Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/employees` | Employee management |
| `/api/dashboard` | HR dashboard |
| `/api/payroll` | Payroll |
| `/api/performance` | Performance management |
| `/api/goals` | Performance goals |
| `/api/review-cycle` | Performance review cycles |
| `/api/attendance` | Attendance |
| `/api/leave` | Leave management |
| `/api/timeoff` | Time-off |
| `/api/issues` | Issue reporting |
| `/api/notifications` | Notifications |
| `/api/worker` | Worker functionality |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MattLCA/Module-2-Core-Project.git
cd Module-2-Core-Project
```

### 2. Set Up MySQL

Open MySQL Workbench and execute:

```
backend/moderntech_db.sql
```

This creates the database, tables, relationships and development data.

### 3. Configure Environment Variables

Create:

```
backend/.env
```

Example:

```env
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=moderntech_db
DB_CONNECTION_LIMIT=10

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=8h

CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

> **Do not commit `.env` to the repository.**

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Start the Backend

```bash
npm run dev
```

The API will run on:

```
http://localhost:4000
```

Expected output:

```
API listening on port 4000
MySQL pool connected
```

---

## 🌐 Frontend

The frontend is built using HTML, CSS and JavaScript.

It communicates with the Express backend using HTTP requests and JSON responses.

### HR Interface

- Dashboard
- Employees
- Payroll
- Performance
- Goals
- Attendance
- Leave
- Time-Off
- Issue Reporting

### Worker Interface

- Dashboard
- Profile
- Attendance
- Leave
- Payslip
- Notifications

---

## 🔄 Application Architecture

The system follows a layered architecture:

```
Frontend
   │
   │ HTTP / JSON
   ▼
Express Routes
   │
   ▼
Middleware
(Authentication / Validation / Authorization)
   │
   ▼
Controllers
   │
   ▼
Models / SQL Queries
   │
   ▼
MySQL Database
```

This separation improves maintainability by keeping routing, authentication, business logic and database access separate.

---

## 🔒 Security

Security features implemented in the application include:

- bcrypt password hashing
- JWT authentication
- Role-based authorization
- Protected API routes
- Helmet security headers
- CORS configuration
- Express Validator request validation
- Parameterized SQL queries
- Environment variables for sensitive configuration
- Employee account deactivation rather than immediate deletion

---

## 🧪 Testing

The backend can be manually tested using tools such as Postman or Thunder Client.

Recommended testing sequence:

1. Start MySQL
2. Start the backend
3. Test `/api/health`
4. Login through `/api/auth/login`
5. Retrieve the JWT
6. Add the JWT as a Bearer token
7. Test protected endpoints

Automated unit and integration testing can be expanded as a future improvement.

---

## 🚧 Future Improvements

Potential future improvements include:

- Automated unit and integration testing
- Swagger/OpenAPI documentation
- Database migrations
- Refresh-token authentication
- Audit logging
- CI/CD integration
- Production deployment
- Enhanced monitoring and logging
- Additional validation and error handling

---

## 👨‍💻 Development Workflow

The project uses Git and GitHub for version control.

The primary development branch is:

```
develop
```

Typical workflow:

```bash
git checkout develop
git pull origin develop

git checkout -b feature/your-feature

git add .
git commit -m "Describe your changes"

git push origin feature/your-feature
```

Completed features can then be reviewed and merged into the `develop` branch.

---

## 📁 Important Files

| File | Purpose |
|---|---|
| `backend/src/index.js` | Express application entry point |
| `backend/src/config/db.js` | MySQL connection pool |
| `backend/src/middleware/auth.js` | JWT authentication and authorization |
| `backend/src/controllers/` | Application/business logic |
| `backend/src/models/` | Database access |
| `backend/src/routes/` | REST API routes |
| `backend/moderntech_db.sql` | Database schema and development data |
| `backend/package.json` | Backend dependencies and scripts |
| `frontend/api.js` | Frontend API communication |
| `frontend/index.html` | Frontend entry/login page |

---

## 🎯 Project Objective

The objective of the ModernTech HR Management System is to provide a centralised, secure and database-driven HR platform.

The project demonstrates the integration of a JavaScript frontend, Node.js/Express REST API, JWT authentication and a relational MySQL database into a complete full-stack application.

The division of responsibilities allowed the team to develop specialised modules while integrating them through a shared backend, authentication system and database.

---

## 👥 Team

### Matthew

**Authentication, HR Administration & Performance Management**

- Authentication & Authorization
- HR Dashboard
- HR Employee Management
- HR Payroll
- HR Performance
- Performance Goals

### Busiswa

**HR Operations**

- Attendance
- Leave Management
- Time-Off
- Issue Reporting

### Angela

**Employee / Worker Portal**

- Worker Dashboard
- Worker Profile
- Worker Attendance
- Worker Leave
- Worker Payslip
- Worker Notifications
