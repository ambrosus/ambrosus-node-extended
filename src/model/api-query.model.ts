import { Request } from 'express';
import { injectable } from 'inversify';
import { parseAPIQuery } from '../util/helpers';

export interface IAPIQuery {
  collection: string;
  query: object;
  limit: number;
  next: string;
  previous: string;
  paginationField: string;

  validate();
  options();
}

@injectable()
export class APIQuery implements IAPIQuery {
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
  protected flieldBlacklist;

  get fields(): any {
    return this.flieldBlacklist;
  }

  get options(): any {
    const opt = {
      projection: this.flieldBlacklist,
    };

    return opt;
  }

  constructor() {
    this.flieldBlacklist = {
      _id: 0,
      repository: 0,
    };
  }

  public validate() {
    // TODO: validate all the things
  }
}
