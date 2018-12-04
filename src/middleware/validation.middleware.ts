/* tslint:disable */
import * as Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';
import { isBase64, isObjectId, isAddress } from '../validation';

const convertToNumber = data => {
  return (!!Number(data) && data == String(Number(data))) ? Number(data) : undefined;
}

export const validate = (
  schema, o?: { params?: boolean, paramsOnly?: boolean, queryParams?: boolean, queryParamsOnly?: boolean }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const options = o || {};

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
      Object.keys(req.params).map(prop => {
        data[prop] = convertToNumber(req.params[prop]) || req.params[prop];
      });
      req.params = data;
    }
    if (options.queryParams) {
      Object.keys(req.query).map(prop => {
        data[prop] = convertToNumber(req.query[prop]) || req.query[prop];
      });
      req.query = data;
    }
    if (options.paramsOnly) {
      data = {};
      Object.keys(req.params).map(prop => {
        data[prop] = convertToNumber(req.params[prop]) || req.params[prop];
      });
      req.params = data;
    }
    if (options.queryParamsOnly) {
      data = {};
      Object.keys(req.query).map(prop => {
        data[prop] = convertToNumber(req.query[prop]) || req.query[prop];
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

