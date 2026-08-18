// Temporary authentication middleware for local testing

const authenticateToken = (req, res, next) => {

    // Mock logged-in user
    // Employee ID 1 = Sibongile Nkosi
    req.user = {
        employeeId: 1
    };

    next();
};

export default authenticateToken;