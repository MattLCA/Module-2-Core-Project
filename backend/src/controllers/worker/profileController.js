import {
    getProfileByEmployeeId
} from '../../models/worker/profileModel.js';


// ============================================================
// GET WORKER PROFILE
// ============================================================

export const getProfile = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const profile = await getProfileByEmployeeId(employeeId);

        if (!profile) {
            return res.status(404).json({
                message: 'Employee profile not found.'
            });
        }

        res.status(200).json({
            data: profile
        });

    } catch (error) {
        console.error('getProfile error:', error);

        res.status(500).json({
            error: 'Failed to retrieve employee profile.'
        });
    }
};