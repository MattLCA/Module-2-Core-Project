import {
    getWorkerDashboard
} from '../../models/worker/dashboardModel.js';


// ============================================================
// GET WORKER DASHBOARD
// ============================================================
// GET /api/worker/dashboard

export const getDashboard = async (req, res) => {

    try {

        const employeeId = req.user.employeeId;

        const dashboard =
            await getWorkerDashboard(employeeId);


        if (!dashboard.employee) {
            return res.status(404).json({
                error: 'Employee not found.'
            });
        }


        res.status(200).json({
            data: dashboard
        });

    } catch (error) {

        console.error(
            'getDashboard error:',
            error
        );

        res.status(500).json({
            error: 'Failed to retrieve dashboard information.'
        });
    }
};