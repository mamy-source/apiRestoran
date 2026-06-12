import {z} from "zod";

export const categorySchema = z.object({
    name: z.string()
        .min(2, "The name must be 2 charters")
        .max(100, "The name is very tall")
        .nonempty('Name is required'),
    description: z.string().max(255).optional(),
})

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