
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateServiceOrder = [
    body('serviceType').isIn(['cab', 'drone', 'truck', 'plane', 'motorbike']).withMessage('Invalid service type.'),
    body('location').isObject().withMessage('Location must be an object.'),
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude in location.'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude in location.'),
    body('destination').isObject().withMessage('Destination must be an object.'),
    body('destination.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude in destination.'),
    body('destination.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude in destination.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
