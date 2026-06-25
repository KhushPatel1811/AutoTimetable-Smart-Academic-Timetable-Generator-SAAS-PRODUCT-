import express from 'express'
import bcrypt from 'bcrypt'
import {body, validationResult} from 'express-validator'
import User from '../Models/LoginModel.js'
import jwt from 'jsonwebtoken'
import RegistrationMiddleware from '../Middleware/Registration_Middleware.js'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import Password_Change_Validator from '../Middleware/Password_Change_Middleware.js'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'


const router = express.Router()

router.post("/login",async (req, resp)=>{
    let {email, password} = req.body;

    // Email & password occurred in backend or not
    if(!email || !password) {
        return resp.status(400).json({message:'Email and Password are required'})
    }

    try {
        // checking is email exist or not
        const user = await User.findOne({email})
        if(!user) {
            resp.status(401).json({message: 'Invalid Credentials'})
            return;
        }
        
        // checking if password is correct or not
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return resp.status(401).json({message: 'Invalid Credentials'})
        }

        const token = jwt.sign({id: user._id, instituteId: user.instituteId}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'})

        return resp.status(200).json({
            message: 'Login Successful',
            user: {
                _id: user._id,
                instituteId:user.instituteId,
                userName: user.userName,
                instituteName: user.instituteName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token
        })
    }
    catch(error) {
        console.error('Error occurred during login', error);
        return resp.status(500).json({message: 'An error occurred while processing your request'})
    }
})



router.post("/register", RegistrationMiddleware(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({message: "Validation Failed",errors: errors.array(),});
  }

  try {
    const { userName, instituteName, email, phoneNumber, role, password } = req.body;
    let instituteId;
    console.log('Role', role)

    if (role === "Admin") {
        // Generate a new, unique ObjectId
        instituteId = new ObjectId();
    }
    console.log('INSTITUTE ID:', instituteId)


    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 2. Ensure only one admin per institute name (MVP logic)
    if (role === "Admin") {
      const existingAdmin = await User.findOne({ instituteName, role: "Admin",});

      if (existingAdmin) {
        return res.status(400).json({
          message: `Admin already exists for this institute`,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    

    // 3. Create user (NO manual instituteId generation)
    const user = new User({ userName, instituteId, instituteName, email, phoneNumber, role, password: hashedPassword});
    await user.save();

    res.status(201).json({message: "User registered successfully",userId: user._id,});
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error occurred while registering user",
    });
  }
});


router.put('/changePassword', authMiddleware, Password_Change_Validator(), async(req, resp, next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return resp.status(400).json({message: errors.array()})
        }

        const user = await User.findOne({email: req.body.email})
        if(!user) {
            return resp.status(404).json({message: 'User Not Found'})
        }

        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password)

        if(!isMatch) {
            return resp.status(400).json({message: 'Current Password Is Incorrect'})
        }
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)


        const response = await User.findOneAndUpdate(
            {_id: user._id},
            {$set: {password:hashedPassword}},
            {new: true, runValidators:true}
        )
        return resp.status(200).json({response})
    }
    catch(err) {
        return resp.status(500).json({message: err.message})
    }
})

export default router;