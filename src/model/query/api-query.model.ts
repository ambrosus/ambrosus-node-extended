import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';

import { config } from '../../config';
import { getMongoFilter, getParamValue, validateOperators } from '../../util/helpers';
import { ValidationError } from '../error';

export interface IAPIPagination {
  limit: number;
  next: string;
  previous: string;
  paginationField: string;
  sortAscending: boolean;
}

export interface IAPIQuery {
  query: object;
  search: string;
  fields: object;
}

@injectable()
export class APIQuery implements IAPIQuery {
  public static fromRequest(req: Request): APIQuery {
    const apiQuery = new APIQuery();
    const query = getParamValue(req, 'query');
    if (query) {
      const errors = validateOperators(query);
      if (errors.length) {
        throw new ValidationError('bad operators found in query', 400);
      }
      apiQuery.query = getMongoFilter(query);
    }
    apiQuery.search = getParamValue(req, 'search');
    apiQuery.limit = +getParamValue(req, 'limit') || +config.paginationDefault;
    apiQuery.next = getParamValue(req, 'next');
    apiQuery.previous = getParamValue(req, 'previous');

    return apiQuery;
  }

  public static validationSchema(): ValidationSchema {
    return {
      limit: {
        in: ['body', 'query'],
        isInt: {
          options: { min: 1 },
        },
        optional: true,
        errorMessage: 'Limit must be a numeric value > 0',
      },
      next: {
        in: ['body', 'query'],
        // isBase64: true,
        optional: true,
        errorMessage: 'Next must be a base64 encoded string',
      },
      previous: {
        in: ['body', 'query'],
        isBase64: true,
        optional: true,
        errorMessage: 'Previous must be a base64 encoded string',
      },
    };
  }

  public query;
  public search;
  public limit: number;
  public next: string;
  public previous: string;
  public paginationField: string;
  public sortAscending: boolean;
  public fields: object;

  constructor(_query?: object) {
    this.query = _query;
    this.fields = {};
  }

  public addToQuery(addition: object) {
    this.query = {
      ...this.query,
      ...addition,
    };
  }
}
