import { Request } from 'express';
import { injectable } from 'inversify';

import { getMongoFilter, getParamValue } from '../../util/helpers';
import { APIPagination } from './api-pagination.model';

export interface IAPIQuery {
  query: object;
  validate();
  options();
  fields();
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

  public accessField;
  public query;
  private blackListFields;

  constructor() {
    super();
    this.blackListFields = {
      //_id: 0, Excluding the _id field is breaking cursor based pagination
      repository: 0,
    };
  }

  get options(): any {
    const opt = {
      projection: this.blackListFields,
    };

    return opt;
  }

  get fields(): any {
    return {
      projection: this.blackListFields,
    };
  }

  public exludeField(field: string) {
    this.blackListFields[field] = 0;
  }

  public validate() {
    // TODO: validate all the things
  }
}
