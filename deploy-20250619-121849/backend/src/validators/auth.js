/**
 * Authentication Validators
 * Enterprise-level request validation for auth endpoints
 */

const Joi = require('joi');
const { AppError } = require('../middleware/error-handler');

/**
 * Password validation schema
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  });

/**
 * Email validation schema
 */
const emailSchema = Joi.string()
  .email()
  .max(255)
  .lowercase()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 255 characters'
  });

/**
 * Register validation
 */
const registerSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match password'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  acceptTerms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must accept the terms and conditions'
    })
});

/**
 * Login validation
 */
const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  remember: Joi.boolean().default(false)
});

/**
 * Forgot password validation
 */
const forgotPasswordSchema = Joi.object({
  email: emailSchema.required()
});

/**
 * Reset password validation
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Reset token is required'
    }),
  password: passwordSchema.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match password'
    })
});

/**
 * Change password validation
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),
  newPassword: passwordSchema.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match new password'
    })
});

/**
 * Refresh token validation
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required'
    })
});

/**
 * Verify email validation
 */
const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Verification token is required'
    })
});

/**
 * Resend verification email validation
 */
const resendVerificationSchema = Joi.object({
  email: emailSchema.required()
});

/**
 * Generic validator middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      req.logger.warn('Validation failed', {
        errors,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

/**
 * Specific validator middlewares
 */
const validateRegister = validate(registerSchema);
const validateLogin = validate(loginSchema);
const validateForgotPassword = validate(forgotPasswordSchema);
const validateResetPassword = validate(resetPasswordSchema);
const validateChangePassword = validate(changePasswordSchema);
const validateRefreshToken = validate(refreshTokenSchema);
const validateVerifyEmail = validate(verifyEmailSchema);
const validateResendVerification = validate(resendVerificationSchema);

/**
 * Validate user exists middleware
 */
const validateUserExists = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    req.existingUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate user doesn't exist middleware
 */
const validateUserDoesNotExist = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (user) {
      return next(new AppError('User already exists with this email', 409, 'USER_EXISTS'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  validateVerifyEmail,
  validateResendVerification,
  validateUserExists,
  validateUserDoesNotExist,
  validate,
  schemas: {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    refreshTokenSchema,
    verifyEmailSchema,
    resendVerificationSchema
  }
}; 