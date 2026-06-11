import {body, validationResult} from 'express-validator'

function Department_Registration_Middleware() {
    return [
        body('DepartmentName')
        .isArray({min:1}).withMessage('At Least 1 Department Name Is Required'),

        body('DepartmentName.*.departmentName')
        .trim()
        .notEmpty().withMessage('Department Name Is Required')
        .isLength({min:3, max:50}).withMessage('At least 3 and At most 50 characters required')
        .matches(/^[A-Za-z0-9 ]+$/).withMessage('Department Name Should Not Contain Special Character')
    ]
}

export default Department_Registration_Middleware;