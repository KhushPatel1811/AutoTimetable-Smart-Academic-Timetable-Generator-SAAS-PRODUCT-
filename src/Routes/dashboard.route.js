import express, { response } from 'express'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import User from '../Models/LoginModel.js'

const router = express.Router()

router.get('/dashboard', authMiddleware, async(req,resp,next) =>{
    try {
        const user = await User.findById(req.user.id).select('-password')

        resp.status(200).json({user})
    }
    catch(err) {
        resp.status(500).json({message: err.message})
    }
})

export default router;