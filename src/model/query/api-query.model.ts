/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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

import { Request } from 'express';
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

interface IQueryPrefixInfo {
  Id: string;
  prefix: string;
  type: string;
}

const queryPrefixes: IQueryPrefixInfo[] = [
  {Id: 'organizationId', prefix: '', type: 'number'},
];

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

  public static fromRequest2(req: Request): APIQuery {
    const apiQuery = new APIQuery();
    const query = getParamValue(req, 'query');
    if (query) {
      const errors = validateOperators(query);
      if (errors.length) {
        throw new ValidationError({ reason: 'bad operators found in query' });
      }
      apiQuery.query = getMongoFilter(query);
    }

    Object.keys(req.query).forEach(key => {
      const prefixInfo = this.getPrefix(key);
      const queryKey = req.query[key];

      delete req.query[key];

      if (prefixInfo.type === 'number') {
        req.query[`${prefixInfo.prefix}${key}`] = +queryKey;
      } else {
        req.query[`${prefixInfo.prefix}${key}`] = queryKey;
      }
    });

    apiQuery.query = req.query;

    apiQuery.search = getParamValue(req, 'search');
    apiQuery.limit = +getParamValue(req, 'limit') || +config.paginationDefault;
    apiQuery.next = getParamValue(req, 'next');
    apiQuery.previous = getParamValue(req, 'previous');

    return apiQuery;
  }

  private static getPrefix(fieldName: string): IQueryPrefixInfo {
    let result = {
      Id: fieldName,
      prefix: 'content.idData.',
      type: 'string',
    };

    queryPrefixes.forEach(item => {
      if (item.Id === fieldName) {
        result = item;

        return;
      }
    });

    return result;
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
