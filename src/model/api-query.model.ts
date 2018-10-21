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
  public static create(req: Request) {
    const apiQuery = new APIQuery();
    apiQuery.query = parseAPIQuery(req.body.query);
    apiQuery.limit = req.body.limit;
    apiQuery.next = req.body.next;
    apiQuery.previous = req.body.previous;
    return apiQuery;
  }

  public collection;
  public query;
  public limit;
  public next;
  public previous;
  public paginationField;
  protected fieldBlacklist;

  get fields(): any {
    return this.fieldBlacklist;
  }

  get options(): any {
    const opt = {
      projection: this.fieldBlacklist,
    };

    return opt;
  }

  constructor() {
    this.fieldBlacklist = {
      _id: 0,
      repository: 0,
    };
  }

  public exludeField(field: string) {
    this.fieldBlacklist[field] = 0;
  }

  public validate() {
    // TODO: validate all the things
  }
}
