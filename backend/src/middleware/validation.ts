import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '@/types/api';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    accessibilitySettings: Joi.object().optional(),
    preferredLanguage: Joi.string().length(2).optional(),
    signLanguagePreference: Joi.string().valid('asl', 'bsl', 'lsf').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    profilePictureUrl: Joi.string().uri().optional(),
    accessibilitySettings: Joi.object().optional(),
    emergencyContacts: Joi.array().items(Joi.object()).optional(),
    preferredLanguage: Joi.string().length(2).optional(),
    signLanguagePreference: Joi.string().valid('asl', 'bsl', 'lsf').optional()
  }),

  createData: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    content: Joi.string().min(1).required(),
    type: Joi.string().min(1).max(50).required(),
    metadata: Joi.object().optional()
  }),

  updateData: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    content: Joi.string().min(1).optional(),
    type: Joi.string().min(1).max(50).optional(),
    metadata: Joi.object().optional()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    search: Joi.string().optional()
  }),

  userId: Joi.object({
    id: Joi.string().uuid().required()
  }),

  dataId: Joi.object({
    id: Joi.string().uuid().required()
  })
};