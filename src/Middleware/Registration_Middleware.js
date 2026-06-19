import {body, validationResult} from 'express-validator'

function registrationMiddleware() {
    return [
        body('userName')
        .trim()
        .notEmpty().withMessage('Name Cannot Be Empty')
        .matches(/^[A-Za-z ]+$/).withMessage('Name Should Contain Only Characters'),
        
        body('instituteName')
        .trim()
        .notEmpty().withMessage('Institute Name Is Required')
        .matches(/^[A-Za-z0-9\s.,&()-]+$/).withMessage('Invalid Institute Name'),
        
        body('email')
        .trim()
        .normalizeEmail()
        .notEmpty().withMessage('Email Is Required')
        .isEmail().withMessage("Please enter a valid email address")
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/).withMessage('Invalid Email Address'),

        body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone Number Is Required')
        .matches(/^[0-9]{10}$/).withMessage('Phone Number Must Contain 10 Digits'),

        body('role')
        .trim()
        .notEmpty().withMessage('Role Is Required')
        .isIn(['Admin', 'Teacher', 'Student']).withMessage('Invalid Role'),
        
        body('password')
        .trim()
        .notEmpty().withMessage('Password Is Required')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{6,}$/).withMessage('Password must contain at least 6 characters, including uppercase, lowercase, number, and special character')
        .isLength({min:6}).withMessage("Password must be at least 6 characters long")
    ]
}

export default registrationMiddleware;