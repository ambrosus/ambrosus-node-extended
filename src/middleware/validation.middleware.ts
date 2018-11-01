import * as express from 'express';
import { validationResult } from 'express-validator/check';

import { APIResponse, APIResponseMeta } from '../model';

function validateRequestMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return `${param}: ${msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    const errorResponse = new APIResponse();
    errorResponse.meta = new APIResponseMeta(422);
    errorResponse.meta.error = 'ValidationError';
    errorResponse.meta.error_message = 'Incorrect data sent to the server';
    errorResponse.meta['validation_error_details'] = errors.array();
    errorResponse.data = undefined;
    errorResponse.pagination = undefined;
    return res.status(errorResponse.meta.code).json(errorResponse);
  }
  return next();
}

export const ValidateRequestMiddleware = validateRequestMiddleware;
