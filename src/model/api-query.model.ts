import { Request } from 'express';
import { injectable } from 'inversify';
import { parseAPIQuery } from '../util/helpers';
import { IAPIPagination } from './api-pagination.model';

export interface IAPIQuery {
  collection: string;
  query: object;

  validate();
  options();
}

@injectable()
export class APIQuery implements IAPIQuery, IAPIPagination {
  public static fromRequest(req: Request) {
    const apiQuery = new APIQuery();
    apiQuery.query = parseAPIQuery(req.body.query || req.query.query);
    apiQuery.limit = +(req.body.limit || req.query.limit);
    apiQuery.next = req.body.next || req.query.next;
    apiQuery.previous = req.body.previous || req.query.previous;
    return apiQuery;
  }

  public collection;
  public query;
  public limit;
  public next;
  public previous;
  public paginationField;
  public sortAscending;
  protected fieldBlacklist;

  get fields(): any {
    return this.fieldBlacklist;
  }

  get options(): any {
    const opt = {
      projection: this.fieldBlacklist
    };

    return opt;
  }

  constructor(query?: object, next?: string, previous?: string, limit?: number) {
    this.fieldBlacklist = {
      _id: 0,
      repository: 0
    };
  }

  public exludeField(field: string) {
    this.fieldBlacklist[field] = 0;
  }

  public validate() {
    // TODO: validate all the things
  }
}
