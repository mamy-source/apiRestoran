import { z } from 'zod';

// Register validator
export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Le nom complet est trop long')
    .nonempty('Le nom complet est requis'),
  
  email: z.string()
    .email('Email invalide')
    .nonempty('Email est requis'),
  
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  
  phoneNumber: z.string().optional(),
});

// Login validator
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().nonempty('Mot de passe requis'),
});

// Refresh token validator
export const refreshTokenSchema = z.object({
  refreshToken: z.string().nonempty('Refresh token requis'),
});

// Upgrade guest to client validator
export const upgradeToClientSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
  fullName: z.string().min(2, 'Nom trop court'),
});

// Validation helper
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return { valid: false, errors };
  }
  
  return { valid: true, data: result.data };
};

// Middleware wrapper
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { valid, errors, data } = validate(schema, req.body);
    
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    
    req.validatedData = data;
    next();
  };
};