import express from 'express'
import bcrypt from 'bcrypt'
import {body, validationResult} from 'express-validator'
import User from '../Models/LoginModel.js'
import jwt from 'jsonwebtoken'
import RegistrationMiddleware from '../Middleware/Registration_Middleware.js'


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
                instituteId:user._id,
                adminName: user.adminName,
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




router.post('/register', RegistrationMiddleware() ,async(req, resp, next)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return resp.status(400).json({message:'Validation Failed', errors:errors.array()})
    }
    
    
    try {
        const {adminName, instituteName, email, phoneNumber, role, password} = req.body
        // Checking if user exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return resp.status(400).json({message:'User with this email already exists'})
        }

        // Ensure only 1 Admin per Institute Name
        if (role === 'Admin') {
            const existingAdmin = await User.findOne({ instituteName, role: 'Admin' });
            if (existingAdmin) {
                return resp.status(400).json({ message: `An administrator already exists for "${instituteName}". Please join as a Teacher or Student, or use a different Institute Name.` });
            }
        }
        
        // Hashing Password and Storing User in Database
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;


        // Generating
        const lastUser = await User.findOne().sort({'instituteId': -1}).select('instituteId')
        const lastInstituteId = lastUser?.instituteId
        let nextId = 1

        if(typeof lastInstituteId === 'string' && lastInstituteId.startsWith('INST')) {
            const num = Number(lastInstituteId.replace('INST', ''))
            if(!isNaN(num)) {
                nextId = num + 1
            }
        }

        const instituteId = `INST${String(nextId).padStart(4, '0')}`

        const user = new User({instituteId, adminName, instituteName, email, phoneNumber, role, password:req.body.password})
        
        await user.save()
        
        console.log('User Created Successfully', user);
        resp.status(201).json({message:'User Registered Successfully'})
    }
    catch(err) {
        console.error('Error creating user', err);
        resp.status(500).json({message: err.message || 'Error Occurred While Registering User'})
    }
})

export default router;