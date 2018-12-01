import * as Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';
import { isBase64, isObjectId, isAddress } from '../validation';

export const validate = (
  schema, options?: { params?: boolean, paramsOnly?: boolean, queryParams?: boolean, queryParamsOnly?: boolean }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addKeyword('isObjectId', {
      async: true,
      type: 'string',
      validate: isObjectId,
    });
    ajv.addKeyword('isBase64', {
      async: true,
      type: 'string',
      validate: isBase64,
    });
    ajv.addKeyword('isAddress', {
      async: true,
      type: 'string',
      validate: isAddress,
    });

    let data = req.body;

    if (options.params) {
      Object.assign(data, req.params);
    }
    if (options.queryParams) {
      Object.assign(data, req.query);
    }
    if (options.paramsOnly) {
      data = {};
      Object.keys(req.params).map(prop => {
        data[prop] = Number(req.params[prop]) || req.params[prop];
      });
      req.params = data;
    }
    if (options.queryParamsOnly) {
      data = {};
      Object.keys(req.query).map(prop => {
        data[prop] = Number(req.query[prop]) || req.query[prop];
      });
      req.query = data;
    }

    const test = ajv.compile(schema);
    try {
      await test(data);
      next();
    } catch (e) {
      next(new ValidationError(e));
    }
  };
};
