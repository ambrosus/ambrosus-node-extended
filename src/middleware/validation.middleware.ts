import * as Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';
import { isObjectId } from '../validation/ajv.validator';
import { ValidationError } from '../errors';

export const validate = schema => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addKeyword('isObjectId', {
      async: true,
      type: 'string',
      validate: isObjectId,
    });

    const test = ajv.compile(schema);
    try {
      await test(req.body);
      next();
    } catch (e) {
      next(new ValidationError(e));
    }
  };
};
