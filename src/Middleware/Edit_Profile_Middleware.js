import {body, validationResult} from 'express-validator'

function EditProfileMiddleware() {
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
        .matches(/^[0-9]{10}/).withMessage('Invalid Mobile Number')
    ]
}

export default EditProfileMiddleware