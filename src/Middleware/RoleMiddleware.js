/**
 * Role-Based Authorization Middleware
 * Restricts route access based on user roles embedded in JWT.
 * Usage: roleMiddleware('Admin') or roleMiddleware('Admin', 'Teacher')
 */

import User from "../Models/LoginModel.js";
 
function roleMiddleware(...allowedRoles) {
    return async (req, resp, next) => {
        try {
            if (!req.user || !req.user.id) {
                return resp.status(401).json({ message: "Unauthorized" });
            }
 
            const user = await User.findById(req.user.id).select("role");
 
            if (!user) {
                return resp.status(401).json({ message: "Unauthorized" });
            }
 
            if (!allowedRoles.includes(user.role)) {
                return resp.status(403).json({ message: "Forbidden: Admin access required" });
            }
 
            req.user.role = user.role;
            next();
        }
        catch (err) {
            return resp.status(500).json({ message: err.message });
        }
    };
}
 
export default roleMiddleware;
