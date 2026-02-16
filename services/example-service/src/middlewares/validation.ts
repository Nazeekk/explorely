import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const exampleSchema = Joi.object({
  exampleRequired: Joi.string().required(),
  exampleOptional: Joi.number().optional(),
  exampleObject: Joi.object({
    exampleField: Joi.string(),
  }),
  exampleArray: Joi.array(),
});

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details[0]?.message,
      });
    }

    next();
  };
}
