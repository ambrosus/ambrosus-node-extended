import { iocContainer } from '../inversify.config';
import { TYPE } from '../constant/types';
import { LoggerService } from '../service/logger.service';
import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

const logger: LoggerService = iocContainer.get<LoggerService>(TYPE.LoggerService);

const createMessage = error => {
  let title: any = '';
  if (error.dataPath) {
    title = error.dataPath.split('.');
    title.shift();
    title = title.join(' ');
  }
  if (error.params.missingProperty) { title = error.params.missingProperty; }

  let message = '';
  switch (error.keyword) {
    case 'pattern':
      message = 'is invalid';
      break;
    case 'required':
      message = 'is required';
      break;
    case 'isUniqueEmail':
      message = 'already exists';
      break;
    case 'isObjectId':
      message = 'is invalid reference ObjectId';
      break;
    case 'additionalProperties':
      message = 'Invalid properties';
      break;
    default:
      message = error.message;
  }

  return `${title} ${message}`.trim();
};

const getErrorMessages = (err: any = {}) => {
  err.error = err.error || {};
  if (err.name === 'MongoError') {
    err.error.reason = err.code === 11000 ? 'There was a duplicate key error' : 'Database error';
  }
  if (err.error.reason) { return err.error.reason; }
  if (!err.error.errors) { return err.error.message; }

  const messages = [];
  try {
    err.error.errors.map(error => {
      if (error.params.errors) {
        error.params.errors.map(e => messages.push(createMessage(e)));
      } else { messages.push(createMessage(error)); }
    });
  } catch (e) {
    logger.warn('Error parsing: ', e);
  }
  return messages.join(', ');
};

export const expressErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let status;

  Sentry.captureException(err);

  let message = `${err.message} ${getErrorMessages(err)}`;

  switch (err.name) {
    case 'ValidationError':
      status = 400;
      break;
    case 'RepositoryError':
      status = 400;
      break;
    case 'ExistsError':
      status = 400;
      break;
    case 'CreateError':
      status = 400;
      break;
    case 'AuthenticationError':
      status = 401;
      break;
    case 'PermissionError':
      status = 403;
      break;
    case 'NotFoundError':
      status = 404;
      break;
    case 'ConnectionError':
      status = 500;
      break;
    default:
      status = 500;
      message = `${err.name}: ${err.message}`;
  }

  res.status(status).json({ meta: { message, code: status } });
};
