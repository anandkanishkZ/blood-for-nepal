import { body } from 'express-validator';

// Validation rules for user registration
export const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('bloodType')
    .notEmpty()
    .withMessage('Blood type is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood type')
];

// Validation rules for user login
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
export const validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),

  body('province')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Province name must be between 2 and 100 characters'),

  body('district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('District name must be between 2 and 100 characters'),

  body('municipality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Municipality name must be between 2 and 100 characters'),

  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 65) {
        throw new Error('Age must be between 16 and 65 years');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),

  body('emergency_contact')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid emergency contact number'),

  body('medical_conditions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Medical conditions must be less than 1000 characters'),

  body('approximate_weight')
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage('Weight must be between 20 and 300 kg'),

  body('blood_type')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood type')
];

// Validation rules for password change
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Validation rules for donor registration
export const validateDonorRegister = [
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits')
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      
      // More accurate age calculation
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18 || age > 65) {
        throw new Error('Donor must be between 18 and 65 years old');
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),

  body('bloodType')
    .notEmpty()
    .withMessage('Blood type is required')
    .isIn(['A', 'B', 'AB', 'O'])
    .withMessage('Please select a valid blood type'),

  body('rhFactor')
    .notEmpty()
    .withMessage('Rh factor is required')
    .isIn(['+', '-'])
    .withMessage('Please select a valid Rh factor'),

  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),

  body('location.province')
    .notEmpty()
    .withMessage('Province is required'),

  body('location.district')
    .notEmpty()
    .withMessage('District is required'),

  body('location.municipality')
    .notEmpty()
    .withMessage('Municipality is required'),

  body('agreedToTerms')
    .custom((value) => {
      // Accept both boolean true and string 'true'
      if (value === true || value === 'true') {
        return true;
      }
      throw new Error('You must agree to the terms and conditions');
    }),

  // Optional fields
  body('lastDonation')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Please provide a valid last donation date'),

  body('medicalConditions')
    .optional({ values: 'falsy' })
    .isLength({ max: 1000 })
    .withMessage('Medical conditions description cannot exceed 1000 characters'),

  body('availableForEmergency')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('Emergency availability must be true or false')
];
