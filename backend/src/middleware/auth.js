/**
 * JWT verification + role-based access control.
 *
 * Usage in a route:
 *   const { authenticate, authorize } = require('../middleware/auth');
 *   router.get('/employees', authenticate, authorize('hr'), controller.list);
 */
import jwt from 'jsonwebtoken';

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload shape set at sign-time in authController: { employeeId, role }
    req.user = payload;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * authorize('hr')                -> only role === 'hr'
 * authorize('hr', 'worker')      -> either role (i.e. just "must be logged in")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    return next();
  };
}

export { authenticate, authorize };