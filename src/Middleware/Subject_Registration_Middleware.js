import {body, validationResult} from 'express-validator'

const Subject_Registration_Middleware = [
    body('Subjects').isArray({min:1}).withMessage('At Least1 item is required'),

    body('Subjects.*.subjectName')
    .trim()
    .notEmpty().withMessage('Subject Name Is Required'),

    body('Subjects.*.subjectCode')
    .trim()
    .notEmpty().withMessage('Subject Code Is Required'),

    body('Subjects.*.semester')
    .trim()
    .notEmpty().withMessage('Semester Is Required')
    .isNumeric().withMessage('Semester must be a valid Number'),

    body('Subjects.*.departmentName')
    .trim()
    .notEmpty().withMessage('Department Name Is Required')
    .matches(/^[A-Za-z0-9 ]+$/).withMessage('Department Name Should Not Contain Special Characters'),

    body('Subjects.*.subjectType')
    .trim()
    .notEmpty().withMessage('Subject Type Is Required')
    .isIn(['Lecture', 'Lab', 'Lecture + Lab']).withMessage('Invalid Subject Type')
    .default('Lecture'),

    body('Subjects.*.weekly_Lecture_Hour')
    .trim()
    .notEmpty().withMessage('Weekly Lecture Hours Is Required')
    .isNumeric().withMessage('Weekly Lecture Hours must be a valid number'),

    body('Subjects.*.weekly_Lab_Hour')
    .trim()
    .notEmpty().withMessage('Weekly Lab Hours Is Required')
    .isNumeric().withMessage('Weekly Lab Hours must be a valid number'),
    
    body('Subjects.*.preferred_Room_Type')
    .trim()
    .notEmpty().withMessage('Preferred Room Type Is Required')
    .isIn(['Lecture', 'Lab', 'Seminar', 'Auditorium']).withMessage('Invalid Preferred Room Type')
]

export default Subject_Registration_Middleware;