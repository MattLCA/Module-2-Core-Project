import db from "../../config/db.js";

// ============================================================
// HR LEAVE MODEL
// Handles leave requests for the HR portal
// ============================================================

class LeaveModel {

    // ============================================================
    // GET ALL LEAVE REQUESTS FOR HR
    // ============================================================

    static async findAll(status = null) {

        // IMPORTANT:
        // This must be "let" because we add WHERE and ORDER BY
        // to the query later.
        let query = `
            SELECT

                lr.leave_request_id AS requestId,

                lr.employee_id AS employeeId,

                e.employee_code AS employeeCode,

                e.name AS employeeFullName,

                d.department_name AS department,

                lt.leave_type_name AS leaveType,

                lr.start_date AS startDate,

                lr.end_date AS endDate,

                lr.total_days AS duration,

                lr.reason,

                lr.status AS leaveStatus,

                lr.submitted_date AS submittedDate,

                lr.reviewed_by AS reviewedBy,

                reviewer.name AS reviewerName

            FROM leave_requests lr

            INNER JOIN employees e
                ON lr.employee_id = e.employee_id

            INNER JOIN departments d
                ON e.department_id = d.department_id

            INNER JOIN leave_types lt
                ON lr.leave_type_id = lt.leave_type_id

            LEFT JOIN employees reviewer
                ON lr.reviewed_by = reviewer.employee_id
        `;

        const params = [];


        // --------------------------------------------------------
        // OPTIONAL STATUS FILTER
        // --------------------------------------------------------

        if (status) {

            query += `
                WHERE lr.status = ?
            `;

            params.push(status);
        }


        // --------------------------------------------------------
        // SORT NEWEST FIRST
        // --------------------------------------------------------

        query += `
            ORDER BY
                lr.created_at DESC,
                lr.leave_request_id DESC
        `;


        const [rows] =
            await db.execute(
                query,
                params
            );


        console.log(
            `[HR Leave Model] Returned ${rows.length} leave request(s).`
        );

        console.table(rows);


        return rows;
    }


    // ============================================================
    // GET ONE LEAVE REQUEST
    // ============================================================

    static async findById(id) {

        const [rows] =
            await db.execute(
                `
                SELECT

                    lr.leave_request_id AS requestId,

                    lr.employee_id AS employeeId,

                    e.employee_code AS employeeCode,

                    e.name AS employeeFullName,

                    d.department_name AS department,

                    lt.leave_type_name AS leaveType,

                    lr.start_date AS startDate,

                    lr.end_date AS endDate,

                    lr.total_days AS duration,

                    lr.reason,

                    lr.status AS leaveStatus,

                    lr.submitted_date AS submittedDate,

                    lr.reviewed_by AS reviewedBy,

                    reviewer.name AS reviewerName

                FROM leave_requests lr

                INNER JOIN employees e
                    ON lr.employee_id = e.employee_id

                INNER JOIN departments d
                    ON e.department_id = d.department_id

                INNER JOIN leave_types lt
                    ON lr.leave_type_id = lt.leave_type_id

                LEFT JOIN employees reviewer
                    ON lr.reviewed_by = reviewer.employee_id

                WHERE lr.leave_request_id = ?

                LIMIT 1
                `,
                [id]
            );


        return rows[0] || null;
    }


    // ============================================================
    // CREATE LEAVE REQUEST
    // ============================================================

    static async create(data) {

        const {
            employeeId,
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason
        } = data;


        const query = `
            INSERT INTO leave_requests
            (
                employee_id,
                leave_type_id,
                start_date,
                end_date,
                total_days,
                reason,
                status,
                submitted_date
            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                'Pending',
                CURRENT_DATE
            )
        `;


        const [result] =
            await db.execute(
                query,
                [
                    employeeId,
                    leaveTypeId,
                    startDate,
                    endDate,
                    totalDays,
                    reason || null
                ]
            );


        return result;
    }


    // ============================================================
    // UPDATE LEAVE STATUS
    // ============================================================

    static async updateStatus(
        id,
        status,
        reviewerId
    ) {

        const query = `
            UPDATE leave_requests

            SET
                status = ?,
                reviewed_by = ?

            WHERE leave_request_id = ?
        `;


        const [result] =
            await db.execute(
                query,
                [
                    status,
                    reviewerId || null,
                    id
                ]
            );


        return result;
    }
}


export default LeaveModel;