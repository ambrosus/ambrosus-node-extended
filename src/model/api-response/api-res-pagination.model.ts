import { injectable } from 'inversify';

import { MongoPagedResult } from '../query/mongo-paged-result.model';

export interface IAPIResponsePagination {
  hasNext: boolean;
  next: string;
  hasPrevious: boolean;
  previous: string;
}

@injectable()
export class APIResponsePagination implements IAPIResponsePagination {
  public static fromMongoPagedResult(mongoPageResult: MongoPagedResult): APIResponsePagination {
    const apiPagination = new APIResponsePagination();
    apiPagination.hasNext = mongoPageResult.hasNext;
    apiPagination.next = mongoPageResult.next;
    apiPagination.hasPrevious = mongoPageResult.hasPrevious;
    apiPagination.previous = mongoPageResult.previous;

    return apiPagination;
  }
  public hasNext: boolean;
  public next: string;
  public hasPrevious: boolean;
  public previous: string;
}
