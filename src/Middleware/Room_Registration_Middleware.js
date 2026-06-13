import {body, validationResult} from 'express-validator'

const Room_Registration_Middleware = [
    body('Rooms').isArray({min: 1}).withMessage('Room Must be an array with at least 1 item'),

    body('Rooms.*.roomName')
    .trim()
    .notEmpty().withMessage('Room Name Cant be empty'),

    body('Rooms.*.roomType')
    .trim()
    .notEmpty().withMessage('Room Type Is Required')
    .isIn(['Lecture', 'Lab', 'Seminar', 'Auditorium']).withMessage('Invalid Room Type'),

    body('Rooms.*.roomStatus')
    .trim()
    .notEmpty().withMessage('Room Status Is Required')
    .isIn(['Available', 'Occupied', 'Under Maintenance']).withMessage('Invalid Room Status'),

    body('Rooms.*.departmentName')
    .trim()
    .notEmpty().withMessage('Department Name is required')
]

export default Room_Registration_Middleware;
