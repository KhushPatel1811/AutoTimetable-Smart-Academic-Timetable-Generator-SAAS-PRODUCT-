/**
 * founderMiddleware — allows access only when req.user.isFounder === true.
 * Must run AFTER authMiddleware (which populates req.user from JWT).
 */
function founderMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    if (req.user.isFounder !== true) {
        return res.status(403).json({ message: "Access denied. Founder access required." });
    }

    next();
}

export default founderMiddleware;
