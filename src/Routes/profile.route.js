import express from "express";
import User from '../Models/LoginModel.js'
import authMiddleware from "../Middleware/AuthMiddleware.js";
import EditProfileMiddleware from "../Middleware/Edit_Profile_Middleware.js";
import {validationResult} from 'express-validator'

const router = express.Router()

router.post('/', authMiddleware, async(req, resp, next)=>{
    try {
        const user = await User.findById(req.user.id).select('-password')

        if(!user) {
            resp.status(404).json({message: 'User Not Found'})
        }

        resp.status(200).json({user})
    }
    catch(err) {
        resp.status(500).json({message: err.message})
    }
})


router.post('/edit', authMiddleware, EditProfileMiddleware(), async(req,resp,next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return resp.status(400).json({message: 'Validation Failed', errors: errors.array()})
        }

        const {adminName, instituteName, email} = req.body

        const user = await User.findById(req.user.id)

        if(!user) {
            return resp.status(404).json({message: 'User Not Found'})
        }

        console.log('--- Profile Update Attempt ---');
        console.log('ID:', req.user.id);
        console.log('New Data:', { adminName, instituteName, email });

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            { $set: { adminName, instituteName, email } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            console.log('Update Result: FAILED (User not found)');
            return resp.status(404).json({ message: 'Update Failed: User Not Found' });
        }

        console.log('Update Result: SUCCESS');
        console.log('Updated Document:', updatedUser);

        return resp.status(200).json({ message: 'Profile Updated Successfully', updatedUser });
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})

export default router