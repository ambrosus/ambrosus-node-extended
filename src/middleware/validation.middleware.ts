import * as express from 'express';
import { validationResult } from 'express-validator/check';

import { APIResponse, APIResponseMeta } from '../model';
import * as HttpStatus from 'http-status-codes';
import { Http } from '@sentry/node/dist/integrations';

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
    const meta = new APIResponseMeta(HttpStatus.UNPROCESSABLE_ENTITY);
    meta.error_type = 'ValidationError';
    meta.error_message = 'Incorrect data sent to the server';
    meta['validation_error_details'] = errors.array();
    return res.status(meta.code).json({meta});
  }
  return next();
}

export const ValidateRequestMiddleware = validateRequestMiddleware;
