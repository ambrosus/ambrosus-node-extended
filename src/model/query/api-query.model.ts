import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';

import { config } from '../../config';
import { getMongoFilter, getParamValue, validateOperators } from '../../util';
import { ValidationError } from '../../errors';

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
        throw new ValidationError({ reason: 'bad operators found in query' });
      }
      apiQuery.query = getMongoFilter(query);
    }
    apiQuery.search = getParamValue(req, 'search');
    apiQuery.limit = +getParamValue(req, 'limit') || +config.paginationDefault;
    apiQuery.next = getParamValue(req, 'next');
    apiQuery.previous = getParamValue(req, 'previous');

    return apiQuery;
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
    this.limit = +config.paginationDefault;
  }

  public addToQuery(addition: object) {
    this.query = {
      ...this.query,
      ...addition,
    };
  }
}
