import * as express from 'express';
import { validationResult } from 'express-validator/check';

function validateRequestMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return `${location}[${param}]: ${msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {

    return res.status(422).json({ errors: errors.array() });
  }
  return next();
}

export const ValidateRequestMiddleware = validateRequestMiddleware;
