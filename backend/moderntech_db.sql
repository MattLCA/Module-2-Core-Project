-- ============================================================
-- MODERNTECH SOLUTIONS
-- MODULE 2 - SHARED HR + WORKER DATABASE
-- ============================================================

DROP DATABASE IF EXISTS moderntech_db;

CREATE DATABASE moderntech_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE moderntech_db;


-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS review_cycle_progress;
DROP TABLE IF EXISTS review_cycles;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;


-- ============================================================
-- ROLES
-- ============================================================

CREATE TABLE roles (
    role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=INNODB;


INSERT INTO roles (
    role_name,
    description
)
VALUES
    ('worker', 'Regular ModernTech employee'),
    ('hr', 'Human Resources employee');


-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    department_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=INNODB;


INSERT INTO departments (
    department_name,
    description
)
VALUES
    ('Development', 'Software and application development'),
    ('HR', 'Human Resources'),
    ('QA', 'Quality Assurance'),
    ('Sales', 'Sales and business development'),
    ('Marketing', 'Marketing and communications'),
    ('Design', 'UI/UX and design'),
    ('IT', 'Information Technology'),
    ('Finance', 'Finance and accounting'),
    ('Support', 'Customer and technical support');


-- ============================================================
-- POSITIONS
-- ============================================================

CREATE TABLE positions (
    position_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=INNODB;


INSERT INTO positions (
    position_name,
    description
)
VALUES
    ('Software Engineer', 'Software development and engineering'),
    ('HR Manager', 'Human Resources management'),
    ('Quality Analyst', 'Software quality assurance and testing'),
    ('Sales Representative', 'Sales and customer acquisition'),
    ('Marketing Specialist', 'Marketing and communications'),
    ('UI/UX Designer', 'User interface and experience design'),
    ('DevOps Engineer', 'Development operations and infrastructure'),
    ('Content Strategist', 'Content planning and strategy'),
    ('Accountant', 'Financial accounting and reporting'),
    ('Customer Support Lead', 'Customer support team leadership');


-- ============================================================
-- EMPLOYEES
-- ============================================================

CREATE TABLE employees (
    employee_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role_id INT UNSIGNED NOT NULL,
    position_id INT UNSIGNED NOT NULL,
    department_id INT UNSIGNED NOT NULL,

    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    employment_history TEXT,
    contact VARCHAR(150),

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_role
        FOREIGN KEY (role_id)
        REFERENCES roles (role_id),

    CONSTRAINT fk_employee_position
        FOREIGN KEY (position_id)
        REFERENCES positions (position_id),

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments (department_id),

    INDEX idx_employee_role (role_id),
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_position (position_id),
    INDEX idx_employee_active (is_active)
) ENGINE=INNODB;


INSERT INTO employees (
    employee_id,
    employee_code,
    name,
    email,
    password_hash,
    role_id,
    position_id,
    department_id,
    base_salary,
    employment_history,
    contact
)
VALUES
    (
        1,
        'EMP001',
        'Sibongile Nkosi',
        'sibongile.nkosi@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        1,
        1,
        70000.00,
        'Joined in 2015, promoted to Senior in 2018',
        'sibongile.nkosi@moderntech.com'
    ),
    (
        2,
        'EMP002',
        'Lungile Moyo',
        'lungile.moyo@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        2,
        2,
        2,
        80000.00,
        'Joined in 2013, promoted to Manager in 2017',
        'lungile.moyo@moderntech.com'
    ),
    (
        3,
        'EMP003',
        'Thabo Molefe',
        'thabo.molefe@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        3,
        3,
        55000.00,
        'Joined in 2018',
        'thabo.molefe@moderntech.com'
    ),
    (
        4,
        'EMP004',
        'Keshav Naidoo',
        'keshav.naidoo@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        4,
        4,
        60000.00,
        'Joined in 2020',
        'keshav.naidoo@moderntech.com'
    ),
    (
        5,
        'EMP005',
        'Zanele Khumalo',
        'zanele.khumalo@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        5,
        5,
        58000.00,
        'Joined in 2019',
        'zanele.khumalo@moderntech.com'
    ),
    (
        6,
        'EMP006',
        'Sipho Zulu',
        'sipho.zulu@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        6,
        6,
        65000.00,
        'Joined in 2016',
        'sipho.zulu@moderntech.com'
    ),
    (
        7,
        'EMP007',
        'Naledi Moeketsi',
        'naledi.moeketsi@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        7,
        7,
        72000.00,
        'Joined in 2017',
        'naledi.moeketsi@moderntech.com'
    ),
    (
        8,
        'EMP008',
        'Farai Gumbo',
        'farai.gumbo@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        8,
        5,
        56000.00,
        'Joined in 2021',
        'farai.gumbo@moderntech.com'
    ),
    (
        9,
        'EMP009',
        'Karabo Dlamini',
        'karabo.dlamini@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        9,
        8,
        62000.00,
        'Joined in 2018',
        'karabo.dlamini@moderntech.com'
    ),
    (
        10,
        'EMP010',
        'Fatima Patel',
        'fatima.patel@moderntech.com',
        '$2b$10$BSB3Wsp2QqecljdYWacbWOgXflzhNEcNFY4fguaY61lJ3XT6wtxa.',
        1,
        10,
        9,
        58000.00,
        'Joined in 2016',
        'fatima.patel@moderntech.com'
    );


-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    attendance_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,

    attendance_date DATE NOT NULL,

    clock_in DATETIME NULL,
    break_start DATETIME NULL,
    break_end DATETIME NULL,
    clock_out DATETIME NULL,

    attendance_status ENUM(
        'Present',
        'Absent',
        'Leave',
        'Late'
    ) NOT NULL DEFAULT 'Present',

    notes VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_attendance_employee_date (
        employee_id,
        attendance_date
    ),

    INDEX idx_attendance_employee (employee_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_status (attendance_status)
) ENGINE=INNODB;


INSERT INTO attendance (
    employee_id,
    attendance_date,
    clock_in,
    break_start,
    break_end,
    clock_out,
    attendance_status
)
VALUES
    (
        1,
        '2026-08-22',
        '2026-08-22 09:00:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        1,
        '2026-08-23',
        '2026-08-23 09:05:00',
        NULL,
        NULL,
        NULL,
        'Present'
    ),
    (
        3,
        '2026-08-22',
        '2026-08-22 08:55:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        4,
        '2026-08-22',
        '2026-08-22 09:00:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:05:00',
        'Present'
    ),
    (
        5,
        '2026-08-22',
        '2026-08-22 08:50:00',
        '2026-08-22 12:45:00',
        '2026-08-22 13:15:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        6,
        '2026-08-22',
        '2026-08-22 09:10:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:10:00',
        'Late'
    ),
    (
        7,
        '2026-08-22',
        '2026-08-22 08:45:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        8,
        '2026-08-22',
        '2026-08-22 09:00:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        9,
        '2026-08-22',
        '2026-08-22 09:05:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    ),
    (
        10,
        '2026-08-22',
        '2026-08-22 08:55:00',
        '2026-08-22 13:00:00',
        '2026-08-22 13:30:00',
        '2026-08-22 17:00:00',
        'Present'
    );


-- ============================================================
-- LEAVE TYPES
-- ============================================================

CREATE TABLE leave_types (
    leave_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    leave_type_name VARCHAR(80) NOT NULL UNIQUE,

    description VARCHAR(255),

    is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=INNODB;


INSERT INTO leave_types (
    leave_type_name,
    description
)
VALUES
    ('Annual Leave', 'Annual vacation leave'),
    ('Sick Leave', 'Leave due to illness'),
    ('Family Responsibility', 'Family responsibility leave'),
    ('Study Leave', 'Leave for approved study purposes'),
    ('Personal', 'Personal leave'),
    ('Vacation', 'Vacation leave'),
    ('Medical Appointment', 'Leave for medical appointments'),
    ('Bereavement', 'Bereavement leave'),
    ('Childcare', 'Childcare-related leave');


-- ============================================================
-- LEAVE BALANCES
-- ============================================================

CREATE TABLE leave_balances (
    balance_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,
    leave_type_id INT UNSIGNED NOT NULL,

    balance_year YEAR NOT NULL,

    allocated_days DECIMAL(6, 2)
        NOT NULL DEFAULT 0.00,

    used_days DECIMAL(6, 2)
        NOT NULL DEFAULT 0.00,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_balance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_balance_leave_type
        FOREIGN KEY (leave_type_id)
        REFERENCES leave_types (leave_type_id),

    UNIQUE KEY uq_employee_leave_year (
        employee_id,
        leave_type_id,
        balance_year
    ),

    INDEX idx_balance_employee (employee_id),
    INDEX idx_balance_leave_type (leave_type_id)
) ENGINE=INNODB;


INSERT INTO leave_balances (
    employee_id,
    leave_type_id,
    balance_year,
    allocated_days,
    used_days
)
SELECT
    e.employee_id,
    lt.leave_type_id,
    2026,

    CASE lt.leave_type_id
        WHEN 1 THEN 15
        WHEN 2 THEN 10
        WHEN 3 THEN 3
        WHEN 4 THEN 5
        WHEN 5 THEN 3
        WHEN 6 THEN 15
        WHEN 7 THEN 2
        WHEN 8 THEN 3
        WHEN 9 THEN 4
    END,

    CASE
        WHEN e.employee_id = 1 AND lt.leave_type_id = 1 THEN 3
        WHEN e.employee_id = 1 AND lt.leave_type_id = 2 THEN 1
        WHEN e.employee_id = 1 AND lt.leave_type_id = 4 THEN 2
        WHEN e.employee_id = 2 AND lt.leave_type_id = 1 THEN 2
        WHEN e.employee_id = 3 AND lt.leave_type_id = 1 THEN 4
        WHEN e.employee_id = 4 AND lt.leave_type_id = 1 THEN 2
        WHEN e.employee_id = 5 AND lt.leave_type_id = 1 THEN 3
        WHEN e.employee_id = 6 AND lt.leave_type_id = 1 THEN 1
        WHEN e.employee_id = 7 AND lt.leave_type_id = 1 THEN 5
        WHEN e.employee_id = 8 AND lt.leave_type_id = 1 THEN 2
        WHEN e.employee_id = 9 AND lt.leave_type_id = 1 THEN 3
        WHEN e.employee_id = 10 AND lt.leave_type_id = 1 THEN 1
        ELSE 0
    END

FROM employees e
CROSS JOIN leave_types lt;


-- ============================================================
-- LEAVE REQUESTS
-- ============================================================

CREATE TABLE leave_requests (
    leave_request_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,
    leave_type_id INT UNSIGNED NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    total_days DECIMAL(6, 2) NOT NULL,

    reason VARCHAR(300),

    status ENUM(
        'Pending',
        'Approved',
        'Rejected'
    ) NOT NULL DEFAULT 'Pending',

    submitted_date DATE NOT NULL,

    reviewed_by INT UNSIGNED NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leave_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_leave_type
        FOREIGN KEY (leave_type_id)
        REFERENCES leave_types (leave_type_id),

    CONSTRAINT fk_leave_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES employees (employee_id)
        ON DELETE SET NULL,

    INDEX idx_leave_employee (employee_id),

    INDEX idx_leave_employee_status (
        employee_id,
        status
    ),

    INDEX idx_leave_dates (
        start_date,
        end_date
    )
) ENGINE=INNODB;


INSERT INTO leave_requests (
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
    status,
    submitted_date,
    reviewed_by
)
VALUES
    (1, 1, '2026-05-14', '2026-05-16', 3,
     'Family trip', 'Approved', '2026-05-01', 2),

    (1, 2, '2026-06-04', '2026-06-04', 1,
     'Flu symptoms', 'Approved', '2026-05-25', 2),

    (1, 3, '2026-09-10', '2026-09-10', 1,
     'Family emergency', 'Pending', '2026-08-15', NULL),

    (2, 1, '2026-07-06', '2026-07-08', 3,
     'Annual leave', 'Approved', '2026-06-20', NULL),

    (2, 4, '2026-09-21', '2026-09-23', 3,
     'Professional development', 'Pending', '2026-08-10', NULL),

    (3, 1, '2026-06-15', '2026-06-18', 4,
     'Personal holiday', 'Approved', '2026-05-30', 2),

    (3, 2, '2026-08-03', '2026-08-04', 2,
     'Medical recovery', 'Approved', '2026-07-20', 2),

    (4, 1, '2026-07-20', '2026-07-21', 2,
     'Family holiday', 'Approved', '2026-07-01', 2),

    (4, 5, '2026-09-14', '2026-09-14', 1,
     'Personal matter', 'Pending', '2026-08-12', NULL),

    (5, 1, '2026-05-25', '2026-05-27', 3,
     'Vacation', 'Approved', '2026-05-05', 2),

    (5, 7, '2026-08-28', '2026-08-28', 1,
     'Medical appointment', 'Pending', '2026-08-10', NULL),

    (6, 1, '2026-06-08', '2026-06-09', 2,
     'Rest and family time', 'Approved', '2026-05-25', 2),

    (6, 2, '2026-08-17', '2026-08-18', 2,
     'Illness', 'Approved', '2026-08-17', 2),

    (7, 1, '2026-04-13', '2026-04-17', 5,
     'Annual vacation', 'Approved', '2026-03-20', 2),

    (7, 8, '2026-08-31', '2026-09-02', 3,
     'Bereavement', 'Pending', '2026-08-20', NULL),

    (8, 1, '2026-07-13', '2026-07-15', 3,
     'Vacation', 'Approved', '2026-06-25', 2),

    (8, 2, '2026-08-05', '2026-08-05', 1,
     'Sick day', 'Approved', '2026-08-05', 2),

    (9, 1, '2026-06-22', '2026-06-24', 3,
     'Annual leave', 'Approved', '2026-06-01', 2),

    (9, 4, '2026-09-07', '2026-09-08', 2,
     'Training course', 'Pending', '2026-08-12', NULL),

    (10, 1, '2026-05-04', '2026-05-06', 3,
     'Vacation', 'Approved', '2026-04-15', 2),

    (10, 3, '2026-08-24', '2026-08-24', 1,
     'Family responsibility', 'Pending', '2026-08-10', NULL);


-- ============================================================
-- PAYROLL
-- ============================================================

CREATE TABLE payroll (
    payroll_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,

    pay_period CHAR(7) NOT NULL,

    hours_worked DECIMAL(6, 2)
        NOT NULL DEFAULT 0.00,

    overtime_pay DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    transport_allowance DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    bonus DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    paye_tax DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    uif DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    pension DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    medical_aid DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    leave_deductions DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    final_salary DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_payroll_employee_period (
        employee_id,
        pay_period
    ),

    INDEX idx_payroll_employee (employee_id),
    INDEX idx_payroll_period (pay_period)
) ENGINE=INNODB;


INSERT INTO payroll (
    employee_id,
    pay_period,
    hours_worked,
    overtime_pay,
    transport_allowance,
    bonus,
    paye_tax,
    uif,
    pension,
    medical_aid,
    leave_deductions,
    final_salary
)
VALUES
    (1, '2026-04', 160, 800, 1500, 500, 8500, 350, 1000, 500, 300, 62150),
    (1, '2026-05', 160, 1200, 1500, 750, 8500, 350, 1000, 500, 500, 62600),
    (1, '2026-06', 160, 1000, 1500, 500, 8500, 350, 1000, 500, 500, 62150),

    (2, '2026-04', 160, 500, 1800, 1000, 10500, 400, 1200, 800, 0, 70400),
    (2, '2026-05', 160, 750, 1800, 1200, 10500, 400, 1200, 800, 300, 70550),
    (2, '2026-06', 160, 600, 1800, 1000, 10500, 400, 1200, 800, 0, 70500),

    (3, '2026-04', 160, 500, 1200, 300, 6000, 300, 700, 450, 0, 49650),
    (3, '2026-05', 160, 700, 1200, 500, 6000, 300, 700, 450, 200, 49750),
    (3, '2026-06', 160, 800, 1200, 300, 6000, 300, 700, 450, 300, 49550),

    (4, '2026-04', 160, 750, 1300, 500, 6800, 300, 800, 500, 200, 54000),
    (4, '2026-05', 160, 900, 1300, 700, 6800, 300, 800, 500, 300, 54200),
    (4, '2026-06', 160, 700, 1300, 500, 6800, 300, 800, 500, 300, 53800),

    (5, '2026-04', 160, 600, 1200, 400, 6200, 290, 700, 450, 150, 52610),
    (5, '2026-05', 160, 800, 1200, 500, 6200, 290, 700, 450, 200, 52860),
    (5, '2026-06', 158, 500, 1200, 300, 6200, 290, 700, 450, 150, 52210),

    (6, '2026-04', 160, 1000, 1500, 500, 7800, 320, 900, 500, 200, 57780),
    (6, '2026-05', 160, 1200, 1500, 750, 7800, 320, 900, 500, 300, 57930),
    (6, '2026-06', 168, 1500, 1500, 800, 7800, 320, 900, 500, 200, 58180),

    (7, '2026-04', 160, 900, 1600, 750, 9000, 360, 1000, 600, 200, 64090),
    (7, '2026-05', 160, 1200, 1600, 1000, 9000, 360, 1000, 600, 300, 64540),
    (7, '2026-06', 175, 1500, 1600, 1000, 9000, 360, 1000, 600, 200, 64940),

    (8, '2026-04', 160, 500, 1200, 300, 6000, 280, 650, 400, 0, 50670),
    (8, '2026-05', 160, 700, 1200, 400, 6000, 280, 650, 400, 150, 50720),
    (8, '2026-06', 160, 600, 1200, 300, 6000, 280, 650, 400, 0, 50770),

    (9, '2026-04', 160, 700, 1400, 500, 7000, 310, 750, 450, 300, 55890),
    (9, '2026-05', 160, 900, 1400, 650, 7000, 310, 750, 450, 400, 56040),
    (9, '2026-06', 155, 600, 1400, 500, 7000, 310, 750, 450, 500, 55490),

    (10, '2026-04', 160, 500, 1200, 400, 6200, 290, 700, 450, 150, 52310),
    (10, '2026-05', 160, 750, 1200, 600, 6200, 290, 700, 450, 200, 52660),
    (10, '2026-06', 162, 800, 1200, 500, 6200, 290, 700, 450, 250, 52610);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,

    notification_type VARCHAR(50)
        NOT NULL DEFAULT 'general',

    title VARCHAR(150),

    message VARCHAR(500) NOT NULL,

    status VARCHAR(30)
        NOT NULL DEFAULT 'New',

    is_read TINYINT(1)
        NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    read_at DATETIME NULL,

    CONSTRAINT fk_notification_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    INDEX idx_notifications_employee (
        employee_id
    ),

    INDEX idx_notifications_unread (
        employee_id,
        is_read
    )
) ENGINE=INNODB;


INSERT INTO notifications (
    employee_id,
    notification_type,
    title,
    message,
    status,
    is_read
)
SELECT
    employee_id,
    'payroll',
    'Payslip Available',
    'Your latest payslip is available for viewing.',
    'Ready',
    0
FROM employees
WHERE role_id = 1;


INSERT INTO notifications (
    employee_id,
    notification_type,
    title,
    message,
    status,
    is_read
)
SELECT
    employee_id,
    'leave',
    'Leave Portal',
    'Your leave balances and requests are available.',
    'Info',
    0
FROM employees
WHERE role_id = 1;


-- ============================================================
-- PERFORMANCE REVIEWS
-- ============================================================

CREATE TABLE performance_reviews (
    review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,

    rating DECIMAL(2, 1) NOT NULL,

    goal_progress INT,

    notes VARCHAR(500),

    review_date DATE NOT NULL,

    reviewed_by INT UNSIGNED NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES employees (employee_id)
        ON DELETE SET NULL,

    UNIQUE KEY uq_performance_employee (
        employee_id
    )
) ENGINE=INNODB;


INSERT INTO performance_reviews (
    employee_id,
    rating,
    goal_progress,
    notes,
    review_date,
    reviewed_by
)
VALUES
    (1, 4.5, 90, 'Strong performance and consistent delivery.', '2026-06-30', 2),
    (3, 4.0, 82, 'Good technical performance.', '2026-06-30', 2),
    (4, 4.2, 85, 'Strong sales and client performance.', '2026-06-30', 2),
    (5, 4.1, 80, 'Good marketing performance.', '2026-06-30', 2),
    (6, 4.3, 88, 'Strong design contributions.', '2026-06-30', 2),
    (7, 4.4, 91, 'Excellent infrastructure performance.', '2026-06-30', 2),
    (8, 3.9, 78, 'Good content delivery.', '2026-06-30', 2),
    (9, 4.0, 81, 'Reliable finance performance.', '2026-06-30', 2),
    (10, 4.2, 86, 'Strong customer support performance.', '2026-06-30', 2);


-- ============================================================
-- GOALS
-- ============================================================

CREATE TABLE goals (
    goal_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    employee_id INT UNSIGNED NOT NULL,

    title VARCHAR(200) NOT NULL,

    status ENUM(
        'on_track',
        'at_risk',
        'behind',
        'completed'
    ) NOT NULL DEFAULT 'on_track',

    progress TINYINT UNSIGNED
        NOT NULL DEFAULT 0,

    due_date DATE,

    created_by INT UNSIGNED NULL,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_goal_creator
        FOREIGN KEY (created_by)
        REFERENCES employees (employee_id)
        ON DELETE SET NULL,

    INDEX idx_goal_employee (employee_id)
) ENGINE=INNODB;


INSERT INTO goals (
    employee_id,
    title,
    status,
    progress,
    due_date,
    created_by
)
VALUES
    (1, 'Complete worker portal improvements', 'on_track', 90, '2026-09-30', 2),
    (3, 'Improve QA automation coverage', 'on_track', 82, '2026-09-30', 2),
    (4, 'Increase quarterly sales targets', 'on_track', 85, '2026-09-30', 2),
    (5, 'Complete marketing campaign', 'on_track', 80, '2026-09-30', 2),
    (6, 'Deliver new UI design system', 'on_track', 88, '2026-09-30', 2),
    (7, 'Improve deployment infrastructure', 'on_track', 91, '2026-09-30', 2),
    (8, 'Complete content strategy', 'on_track', 78, '2026-09-30', 2),
    (9, 'Complete financial reporting improvements', 'on_track', 81, '2026-09-30', 2),
    (10, 'Improve customer support response time', 'on_track', 86, '2026-09-30', 2);


-- ============================================================
-- REVIEW CYCLES
-- ============================================================

CREATE TABLE review_cycles (
    review_cycle_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    cycle_name VARCHAR(50) NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    is_active TINYINT(1)
        NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;


INSERT INTO review_cycles (
    cycle_name,
    start_date,
    end_date,
    is_active
)
VALUES (
    'Q3 2026',
    '2026-07-01',
    '2026-09-30',
    1
);


-- ============================================================
-- REVIEW CYCLE PROGRESS
-- ============================================================

CREATE TABLE review_cycle_progress (
    progress_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    review_cycle_id INT UNSIGNED NOT NULL,
    employee_id INT UNSIGNED NOT NULL,

    self_review_submitted TINYINT(1)
        NOT NULL DEFAULT 0,

    manager_review_submitted TINYINT(1)
        NOT NULL DEFAULT 0,

    calibration_complete TINYINT(1)
        NOT NULL DEFAULT 0,

    finalized TINYINT(1)
        NOT NULL DEFAULT 0,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rcp_cycle
        FOREIGN KEY (review_cycle_id)
        REFERENCES review_cycles (review_cycle_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rcp_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees (employee_id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_cycle_employee (
        review_cycle_id,
        employee_id
    )
) ENGINE=INNODB;


INSERT INTO review_cycle_progress (
    review_cycle_id,
    employee_id
)
SELECT
    1,
    employee_id
FROM employees
WHERE is_active = 1;


-- ============================================================
-- VIEW: EMPLOYEE DETAILS
-- ============================================================

CREATE OR REPLACE VIEW employee_details AS
SELECT
    e.employee_id,
    e.employee_code,
    e.name,
    e.email,
    e.password_hash,

    r.role_id,
    r.role_name,

    p.position_id,
    p.position_name,

    d.department_id,
    d.department_name,

    e.base_salary,
    e.employment_history,
    e.contact,
    e.is_active,

    e.created_at,
    e.updated_at

FROM employees e

INNER JOIN roles r
    ON e.role_id = r.role_id

INNER JOIN positions p
    ON e.position_id = p.position_id

INNER JOIN departments d
    ON e.department_id = d.department_id;


-- ============================================================
-- VIEW: EMPLOYEE LEAVE BALANCES
-- ============================================================

CREATE OR REPLACE VIEW employee_leave_balances AS
SELECT
    lb.balance_id,
    lb.employee_id,

    e.employee_code,
    e.name,

    lb.leave_type_id,
    lt.leave_type_name,

    lb.balance_year,
    lb.allocated_days,
    lb.used_days,

    (
        lb.allocated_days - lb.used_days
    ) AS remaining_days,

    lb.updated_at

FROM leave_balances lb

INNER JOIN employees e
    ON lb.employee_id = e.employee_id

INNER JOIN leave_types lt
    ON lb.leave_type_id = lt.leave_type_id;


-- ============================================================
-- VIEW: EMPLOYEE LEAVE REQUESTS
-- ============================================================

CREATE OR REPLACE VIEW employee_leave_requests AS
SELECT
    lr.leave_request_id,
    lr.employee_id,

    e.employee_code,
    e.name,

    lr.leave_type_id,
    lt.leave_type_name,

    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.reason,
    lr.status,

    lr.submitted_date,
    lr.reviewed_by,

    reviewer.name AS reviewer_name,

    lr.created_at,
    lr.updated_at

FROM leave_requests lr

INNER JOIN employees e
    ON lr.employee_id = e.employee_id

INNER JOIN leave_types lt
    ON lr.leave_type_id = lt.leave_type_id

LEFT JOIN employees reviewer
    ON lr.reviewed_by = reviewer.employee_id;


-- ============================================================
-- VIEW: EMPLOYEE PAYSLIPS
-- ============================================================

CREATE OR REPLACE VIEW employee_payslips AS
SELECT
    p.payroll_id,
    p.employee_id,

    e.employee_code,
    e.name,
    e.email,

    pos.position_name,
    d.department_name,

    e.base_salary,

    p.pay_period,
    p.hours_worked,

    p.overtime_pay,
    p.transport_allowance,
    p.bonus,

    p.paye_tax,
    p.uif,
    p.pension,
    p.medical_aid,
    p.leave_deductions,

    (
        e.base_salary
        + p.overtime_pay
        + p.transport_allowance
        + p.bonus
    ) AS total_earnings,

    (
        p.paye_tax
        + p.uif
        + p.pension
        + p.medical_aid
        + p.leave_deductions
    ) AS total_deductions,

    (
        e.base_salary
        + p.overtime_pay
        + p.transport_allowance
        + p.bonus
        - p.paye_tax
        - p.uif
        - p.pension
        - p.medical_aid
        - p.leave_deductions
    ) AS final_salary,

    p.created_at

FROM payroll p

INNER JOIN employees e
    ON p.employee_id = e.employee_id

INNER JOIN positions pos
    ON e.position_id = pos.position_id

INNER JOIN departments d
    ON e.department_id = d.department_id;


-- ============================================================
-- VIEW: EMPLOYEE GOALS
-- ============================================================

CREATE OR REPLACE VIEW employee_goals AS
SELECT
    g.goal_id,
    g.employee_id,

    e.employee_code,
    e.name,

    g.title,
    g.status,
    g.progress,
    g.due_date,

    g.created_by,

    creator.name AS created_by_name,

    g.created_at,
    g.updated_at

FROM goals g

INNER JOIN employees e
    ON g.employee_id = e.employee_id

LEFT JOIN employees creator
    ON g.created_by = creator.employee_id;


-- ============================================================
-- VIEW: EMPLOYEE REVIEW CYCLE PROGRESS
-- ============================================================

CREATE OR REPLACE VIEW employee_review_cycle_progress AS
SELECT
    rcp.progress_id,

    rcp.review_cycle_id,

    rc.cycle_name,
    rc.start_date,
    rc.end_date,

    rc.is_active AS cycle_is_active,

    rcp.employee_id,

    e.employee_code,
    e.name,

    rcp.self_review_submitted,
    rcp.manager_review_submitted,
    rcp.calibration_complete,
    rcp.finalized,

    rcp.updated_at

FROM review_cycle_progress rcp

INNER JOIN review_cycles rc
    ON rcp.review_cycle_id = rc.review_cycle_id

INNER JOIN employees e
    ON rcp.employee_id = e.employee_id;


-- ============================================================
-- BASIC VERIFICATION
-- ============================================================

SELECT
    e.employee_id,
    e.employee_code,
    e.name,
    r.role_name AS role,
    p.position_name AS position,
    d.department_name AS department,
    e.email,
    e.base_salary,
    e.is_active
FROM employees e
INNER JOIN roles r
    ON e.role_id = r.role_id
INNER JOIN positions p
    ON e.position_id = p.position_id
INNER JOIN departments d
    ON e.department_id = d.department_id
ORDER BY e.employee_id;


SELECT
    COUNT(*) AS total_employees
FROM employees;


SELECT
    COUNT(*) AS total_attendance_records
FROM attendance;


SELECT
    COUNT(*) AS total_leave_requests
FROM leave_requests;


SELECT
    COUNT(*) AS total_payroll_records
FROM payroll;


SELECT
    COUNT(*) AS total_notifications
FROM notifications;


SELECT
    COUNT(*) AS total_performance_reviews
FROM performance_reviews;


SELECT
    COUNT(*) AS total_goals
FROM goals;


SELECT
    COUNT(*) AS total_review_cycles
FROM review_cycles;


-- ============================================================
-- PENDING LEAVE REQUESTS
-- ============================================================

SELECT
    lr.leave_request_id,
    e.employee_code,
    e.name,
    lt.leave_type_name,
    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.reason,
    lr.status
FROM leave_requests lr
INNER JOIN employees e
    ON lr.employee_id = e.employee_id
INNER JOIN leave_types lt
    ON lr.leave_type_id = lt.leave_type_id
WHERE lr.status = 'Pending'
ORDER BY lr.leave_request_id;


-- ============================================================
-- PAYROLL CHECK
-- ============================================================

SELECT
    p.payroll_id,
    e.employee_code,
    e.name,
    p.pay_period,
    p.hours_worked,
    p.final_salary
FROM payroll p
INNER JOIN employees e
    ON p.employee_id = e.employee_id
ORDER BY
    p.pay_period DESC,
    e.employee_id;


-- ============================================================
-- NOTIFICATION CHECK
-- ============================================================

SELECT
    n.notification_id,
    e.employee_code,
    e.name,
    n.notification_type,
    n.title,
    n.message,
    n.status,
    n.is_read,
    n.created_at,
    n.read_at
FROM notifications n
INNER JOIN employees e
    ON n.employee_id = e.employee_id
ORDER BY n.created_at DESC;