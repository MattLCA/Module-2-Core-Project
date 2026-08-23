import pool from "../config/db.js";


// ============================================================
// TOTAL EMPLOYEES
// ============================================================

async function getTotalEmployees() {

    const [rows] =
        await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM employees
            WHERE is_active = 1
            `
        );


    return Number(
        rows[0].count
    );

}


// ============================================================
// PENDING LEAVE
// ============================================================

async function getPendingLeaveCount() {

    const [rows] =
        await pool.query(
            `
            SELECT COUNT(*) AS count

            FROM leave_requests

            WHERE status = 'Pending'
            `
        );


    return Number(
        rows[0].count
    );

}


// ============================================================
// ATTENDANCE SNAPSHOT
// ============================================================

async function getAttendanceSnapshot() {

    const [latestRows] =
        await pool.query(
            `
            SELECT
                MAX(attendance_date)
                AS latestDate

            FROM attendance
            `
        );


    const latestDate =
        latestRows[0]
            ?.latestDate;


    if (!latestDate) {

        return {

            date: null,
            present: 0,
            absent: 0,
            percentPresent: 0

        };

    }


    const [rows] =
        await pool.query(

            `
            SELECT
                attendance_status,
                COUNT(*) AS count

            FROM attendance

            WHERE attendance_date = ?

            GROUP BY attendance_status
            `,

            [latestDate]

        );


    let present = 0;
    let absent = 0;


    for (
        const row of rows
    ) {

        if (
            row.attendance_status ===
            "Present"
        ) {

            present =
                Number(
                    row.count
                );

        }


        if (
            row.attendance_status ===
            "Absent"
        ) {

            absent =
                Number(
                    row.count
                );

        }

    }


    const total =
        present + absent;


    return {

        date: latestDate,

        present,

        absent,

        percentPresent:
            total
                ? Math.round(
                    (
                        present /
                        total
                    ) * 100
                )
                : 0

    };

}


// ============================================================
// LEAVE FEED
// ============================================================

async function getLeaveFeed(
    limit = 8
) {

    const [rows] =
        await pool.query(

            `
            SELECT

                lr.leave_request_id,
                lr.employee_id,

                e.name
                    AS employee_name,

                lt.leave_type_name
                    AS leave_type,

                lr.start_date,
                lr.end_date,
                lr.total_days,

                lr.status,
                lr.reason

            FROM leave_requests lr

            INNER JOIN employees e
                ON e.employee_id =
                   lr.employee_id

            INNER JOIN leave_types lt
                ON lt.leave_type_id =
                   lr.leave_type_id

            ORDER BY
                lr.created_at DESC

            LIMIT ?
            `,

            [limit]

        );


    return rows;

}


// ============================================================
// SUMMARY
// ============================================================

async function getSummary() {

    const [
        totalEmployees,
        pendingLeaveCount,
        attendance,
        leaveFeed
    ] = await Promise.all([

        getTotalEmployees(),

        getPendingLeaveCount(),

        getAttendanceSnapshot(),

        getLeaveFeed()

    ]);


    return {

        totalEmployees,

        pendingLeaveCount,

        attendance,

        leaveFeed

    };

}


export {
    getSummary
};