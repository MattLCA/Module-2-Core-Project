// (Temporary Placeholder)
const authenticateToken = (req, res, next) => {
    // Mock user for local testing (matches your MySQL employeeId)
    req.user = { employeeId: 1 };
    next();
};

export default authenticateToken;