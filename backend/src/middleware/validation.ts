import { Request, Response, NextFunction } from 'express';
const { body, param, query, validationResult } = require('express-validator');
import { AppError } from './errorHandler';

// Check validation results and return errors if any
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => error.msg).join(', ');
    return next(new AppError(`Validation Error: ${errorMessages} 💔`, 400));
  }
  next();
};

// User validation rules
export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters 💕'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address 💌'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long 🔐')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character 🔐'),
  
  body('role')
    .isIn(['boyfriend', 'girlfriend', 'partner'])
    .withMessage('Role must be boyfriend, girlfriend, or partner 💝'),
  
  body('accessKey')
    .isLength({ min: 6 })
    .withMessage('Access key must be at least 6 characters long 🗝️'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number 📱'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth 🎂'),
  
  handleValidationErrors
];

export const validateSignin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address 💌'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required 🔐'),
  
  handleValidationErrors
];

export const validateAccessKey = [
  body('accessKey')
    .isLength({ min: 6 })
    .withMessage('Access key must be at least 6 characters long 🗝️'),
  
  handleValidationErrors
];

// Moodboard validation rules
export const validateMoodboard = [
  body('moodName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Mood name must be between 2 and 50 characters 🎨'),
  
  body('description')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Description must be between 5 and 300 characters 📝'),
  
  body('customText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Custom text cannot exceed 200 characters ✨'),
  
  body('theme')
    .isIn(['romantic', 'playful', 'cozy', 'dreamy', 'passionate', 'peaceful'])
    .withMessage('Theme must be one of: romantic, playful, cozy, dreamy, passionate, peaceful �'),
  
  handleValidationErrors
];

export const validateMoodboardUpdate = [
  body('moodName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Mood name must be between 2 and 50 characters �'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Description must be between 5 and 300 characters 📝'),
  
  body('customText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Custom text cannot exceed 200 characters ✨'),
  
  body('theme')
    .optional()
    .isIn(['romantic', 'playful', 'cozy', 'dreamy', 'passionate', 'peaceful'])
    .withMessage('Theme must be one of: romantic, playful, cozy, dreamy, passionate, peaceful 🎭'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value �'),
  
  handleValidationErrors
];

// Service validation rules
export const validateService = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Service title must be between 3 and 100 characters 💫'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Service description must be between 10 and 1000 characters 📋'),
  
  body('category')
    .isIn(['date-ideas', 'gifts', 'experiences', 'surprises', 'help', 'other'])
    .withMessage('Category must be one of: date-ideas, gifts, experiences, surprises, help, other 🎁'),
  
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Subcategory cannot exceed 50 characters 🏷️'),
  
  body('creditCost')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Credit cost must be between 1 and 1000 credits 💎'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive number (in minutes) ⏱️'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array 📋'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array 🏷️'),
  
  handleValidationErrors
];

export const validateServiceBooking = [
  body('preferredDate')
    .optional()
    .isISO8601()
    .withMessage('Preferred date must be a valid date 📅'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters 📝'),
  
  handleValidationErrors
];

export const validateServiceRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars ⭐'),
  
  body('review')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters 📝'),
  
  handleValidationErrors
];

// Credit validation rules
export const validateCreditTransaction = [
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number 💎'),
  
  body('type')
    .isIn(['earned', 'spent', 'bonus', 'penalty', 'refund'])
    .withMessage('Transaction type must be one of: earned, spent, bonus, penalty, refund 💰'),
  
  body('description')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Description must be between 3 and 200 characters 📝'),
  
  body('relatedId')
    .optional()
    .isMongoId()
    .withMessage('Related ID must be a valid MongoDB ObjectId 🔗'),
  
  body('relatedModel')
    .optional()
    .isIn(['Service', 'Grievance', 'Moodboard'])
    .withMessage('Related model must be one of: Service, Grievance, Moodboard 📊'),
  
  handleValidationErrors
];

// Grievance validation rules
export const validateGrievance = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Grievance title must be between 5 and 100 characters 📢'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Grievance description must be between 20 and 2000 characters 📝'),
  
  body('category')
    .isIn(['communication', 'time-management', 'intimacy', 'finances', 'family', 'habits', 'trust', 'other'])
    .withMessage('Category must be one of: communication, time-management, intimacy, finances, family, habits, trust, other 💭'),
  
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent ⚡'),
  
  body('severity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Severity must be a number between 1 and 10 🌡️'),
  
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array 📸'),
  
  handleValidationErrors
];

export const validateGrievanceResponse = [
  body('response')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Response must be between 10 and 1000 characters 💬'),
  
  handleValidationErrors
];

export const validateGrievanceResolution = [
  body('resolution')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution must be between 10 and 1000 characters ✅'),
  
  body('satisfactionRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating must be between 1 and 5 stars ⭐'),
  
  handleValidationErrors
];

// Common parameter validations
export const validateMongoId = (paramName: string) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId 🔗`),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number 📄'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100 📊'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title'])
    .withMessage('Sort must be one of: createdAt, -createdAt, updatedAt, -updatedAt, title, -title 🔄'),
  
  handleValidationErrors
];
