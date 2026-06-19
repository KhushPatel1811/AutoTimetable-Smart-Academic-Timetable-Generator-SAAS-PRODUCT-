import {body, validationResult} from 'express-validator'

function Password_Change_Validator() {
    return [
        body('currentPassword')
        .trim()
        .notEmpty().withMessage('Current Password Is Required'),

        body('newPassword')
        .trim()
        .notEmpty().withMessage('New Password Is Required'),

        body('confirmNewPassword')
        .trim()
        .notEmpty().withMessage('Confirm New Password Is Required')
        .custom((value, {req})=>{
            if(value != req.body.newPassword) {
                throw new Error('Passwords Do Not Match')
            }
            return true
        })
    ]
}

export default Password_Change_Validator