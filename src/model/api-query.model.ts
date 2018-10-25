import { Request } from 'express';
import { injectable } from 'inversify';

import { APIPagination } from './api-pagination.model';
import * as _ from 'lodash';
import { getMongoFilter, getParamValue } from '../util/helpers';

export interface IAPIQuery {
  query: object;
  validate();
  options();
}

@injectable()
export class APIQuery extends APIPagination implements IAPIQuery {
  public static fromRequest(req: Request) {
    const apiQuery = new APIQuery();
    const query = getParamValue(req, 'query');
    if (query) {
      apiQuery.query = getMongoFilter(query);
    }
    apiQuery.limit = +getParamValue(req, 'limit') || undefined;
    apiQuery.next = getParamValue(req, 'next');
    apiQuery.previous = getParamValue(req, 'previous');

    return apiQuery;
  }

  public aggregate;
  public pipeline;
  public query;
  private fieldBlacklist;

  constructor() {
    super();
    this.fieldBlacklist = {
      _id: 0,
      repository: 0,
    };
  }

  get fields(): any {
    return this.fieldBlacklist;
  }

  get options(): any {
    const opt = {
      projection: this.fieldBlacklist,
    };

    return opt;
  }

  public exludeField(field: string) {
    this.fieldBlacklist[field] = 0;
  }

  public validate() {
    // TODO: validate all the things
  }
}
