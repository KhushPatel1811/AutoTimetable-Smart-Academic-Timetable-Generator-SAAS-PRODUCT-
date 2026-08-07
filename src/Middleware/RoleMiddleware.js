/**
 * Role-Based Authorization Middleware
 * Restricts route access based on user roles embedded in JWT.
 * Usage: roleMiddleware('Admin') or roleMiddleware('Admin', 'Teacher')
 */
function roleMiddleware(...allowedRoles) {
    return (req, res, next) => {
        // authMiddleware must run first and attach req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
}

export default roleMiddleware;
