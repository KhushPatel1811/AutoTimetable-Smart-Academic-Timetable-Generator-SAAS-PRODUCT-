import {body, validationResult} from 'express-validator'

function TeacherUpdateMiddleware() {
    return [
    body('teacherId')
    .notEmpty().withMessage('Teacher Id Cannot be Empty'),

    body('teacherName')
    .notEmpty().withMessage('Teacher Name Cannot Be Empty')
    .matches(/^[A-Za-z ]+$/).withMessage('Teacher Name Should Contain Only Characters'),

    body('instituteName')
    .notEmpty().withMessage('Institute Name Is Required')
    .matches(/^[A-Za-z ]+$/).withMessage('Teacher Name Should Contain Only Characters'),

    body('instituteId')
    .notEmpty().withMessage('Institute Id Is Required'),

    body('teacherEmail')
    .notEmpty().withMessage('Teacher Email Cannot Be Empty')
    .isEmail().withMessage('Invalid Email Address'),

    body('teacherPhoneNumber')
    .notEmpty().withMessage('Teacher Phone Number Cannot Be Empty')
    .matches(/^[0-9]{10}$/).withMessage('Phone Number Should Contain Exactly 10 digits'),

    body('teacherDepartment')
    .notEmpty().withMessage('Teacher Department Cannot Be Empty'),

    body('teacherAvailability')
    .notEmpty().withMessage('Teacher Availability Cannot Be Empty')
    .isIn(['Available', 'Busy', 'On Leave']).withMessage('Invalid Availability Value'),

    body('Subjects')
    .isArray({min: 1}).withMessage('At Least 1 Subject Is Required'),

    body('Subjects.*.subjects')
    .notEmpty().withMessage('Subject Cannot Be Empty')
    .matches(/^[A-Za-z ]+$/).withMessage('Subject Name Should Contain Only Characters')
    ]
}

export default TeacherUpdateMiddleware;