import {body, validationResult} from 'express-validator'

function TeacherRegistrationMiddleware() {
    return [
        body('teacherName')
        .trim()
        .notEmpty().withMessage('Teacher Name Is Required')
        .matches(/^[A-Za-z ]+$/).withMessage('Teacher Name Should Contain Only Characters'),

        body('teacherEmail')
        .trim()
        .normalizeEmail()
        .notEmpty().withMessage('Teacher Email Is Required')
        .isEmail().withMessage('Invalid Email Address')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/).withMessage('Invalid Email Address'),

        body('teacherPhoneNumber')
        .trim()
        .notEmpty().withMessage('Teacher Phone Number Is Required')
        .matches(/^[0-9]{10}$/).withMessage('Teacher Phone Number Must Contain 10 Digits'),

        body('teacherDepartment')
        .trim()
        .notEmpty().withMessage('Teacher Department Is Required')
        .matches(/^[A-Za-z ]+$/).withMessage('Department Name Should Contain Only Characters'),

        body('teacherAvailability')
        .trim()
        .notEmpty().withMessage('Teacher Availability Is Required')
        .isIn(['Available', 'Busy', 'On Leave']).withMessage('Invalid Teacher Availability Status'),

        body('Subjects')
        .notEmpty().withMessage('Subjects Are Required')
        .isArray({min: 1}).withMessage('At Least 1 Subject Is Required'),

        body('Subjects.*.subjects')
        .trim()
        .notEmpty().withMessage('Subject Name is Required')
        .matches(/^[A-Za-z ]+$/).withMessage('Subject Name Should Contain Only Characters')
    ]
}

export default TeacherRegistrationMiddleware;