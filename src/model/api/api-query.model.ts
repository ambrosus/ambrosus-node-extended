import { Request } from 'express';
import { injectable } from 'inversify';

import { getMongoFilter, getParamValue } from '../../util/helpers';
import { APIPagination } from './api-pagination.model';
import { ValidationSchema } from 'express-validator/check';
import { config } from '../../config';

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
        isBase64: true,
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

  public accessField;
  public query;
  private blackListFields;

  constructor() {
    super();
    this.blackListFields = {
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
