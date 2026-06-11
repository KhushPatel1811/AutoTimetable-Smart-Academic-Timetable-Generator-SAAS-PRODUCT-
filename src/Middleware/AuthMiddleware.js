import jwt from 'jsonwebtoken'

function authMiddleware(req,resp, next) {
    try {
        const authHeader  = req.headers.authorization

        if(!authHeader) {
            resp.status(401).json({message: 'No Auth Token Found'})
        }
        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        req.user = decoded
        next()
    }
    catch(err) {
        resp.status(401).json({message: 'Invalid Token'})
    }
}

export default authMiddleware;