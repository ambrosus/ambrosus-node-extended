/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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

