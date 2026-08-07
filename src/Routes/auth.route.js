import express from 'express'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import User from '../Models/LoginModel.js'
import jwt from 'jsonwebtoken'
import RegistrationMiddleware from '../Middleware/Registration_Middleware.js'
import authMiddleware from '../Middleware/AuthMiddleware.js'
import Password_Change_Validator from '../Middleware/Password_Change_Middleware.js'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import logActivity from '../Services/ActivityLogService.js'
import createNotification from '../Services/NotificationService.js'

const router = express.Router()

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, resp) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return resp.status(400).json({ message: 'Email and Password are required' })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            await logActivity({
                req,
                module: "Authentication",
                action: "Login",
                description: `Failed login attempt for email: ${email}`,
                status: "Failed",
                userOverride: { userName: "Unknown", email, role: "" },
            });
            resp.status(401).json({ message: 'Invalid Credentials' })
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await logActivity({
                req,
                module: "Authentication",
                action: "Login",
                description: `Failed login: incorrect password for ${email}`,
                status: "Failed",
                userOverride: { id: user._id, userName: user.userName, email: user.email, role: user.role, instituteId: user.instituteId },
            });
            return resp.status(401).json({ message: 'Invalid Credentials' })
        }

        const token = jwt.sign(
            { id: user._id, instituteId: user.instituteId, role: user.role, isFounder: user.isFounder === true },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )

        // Log successful login
        await logActivity({
            req,
            module: "Authentication",
            action: "Login",
            description: `${user.userName} (${user.role}) logged in successfully.`,
            status: "Success",
            userOverride: { id: user._id, userName: user.userName, email: user.email, role: user.role, instituteId: user.instituteId },
        });

        return resp.status(200).json({
            message: 'Login Successful',
            user: {
                _id: user._id,
                instituteId: user.instituteId,
                userName: user.userName,
                instituteName: user.instituteName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isFounder: user.isFounder === true,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token
        })
    }
    catch (error) {
        console.error('Error occurred during login', error);
        return resp.status(500).json({ message: 'An error occurred while processing your request' })
    }
})

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post("/register", RegistrationMiddleware(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation Failed", errors: errors.array() });
    }

    try {
        const { userName, instituteName, email, phoneNumber, role, password } = req.body;
        let instituteId;

        if (role === "Admin") {
            instituteId = new ObjectId();
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        if (role === "Admin") {
            const existingAdmin = await User.findOne({ instituteName, role: "Admin" });
            if (existingAdmin) {
                return res.status(400).json({ message: `Admin already exists for this institute` });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ userName, instituteId, instituteName, email, phoneNumber, role, password: hashedPassword });
        await user.save();

        await logActivity({
            req,
            module: "Authentication",
            action: "Register",
            description: `New ${role} account registered: ${userName} (${email}) for ${instituteName}.`,
            status: "Success",
            userOverride: { id: user._id, userName, email, role, instituteId },
        });

        res.status(201).json({ message: "User registered successfully", userId: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message || "Error occurred while registering user" });
    }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.put('/changePassword', authMiddleware, Password_Change_Validator(), async (req, resp) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return resp.status(400).json({ message: errors.array() })
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return resp.status(404).json({ message: 'User Not Found' })
        }

        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password)
        if (!isMatch) {
            await logActivity({
                req,
                module: "Authentication",
                action: "PasswordChange",
                description: `Failed password change for ${req.body.email}: incorrect current password.`,
                status: "Failed",
            });
            return resp.status(400).json({ message: 'Current Password Is Incorrect' })
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)
        const response = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { password: hashedPassword } },
            { new: true, runValidators: true }
        )

        await logActivity({
            req,
            module: "Authentication",
            action: "PasswordChange",
            description: `Password changed successfully for ${user.email}.`,
            status: "Success",
        });

        return resp.status(200).json({ response })
    }
    catch (err) {
        return resp.status(500).json({ message: err.message })
    }
})

export default router;
