// Based on https://www.instagram.com/developer/endpoints/

import { injectable } from 'inversify';
import { MongoPagedResult } from '../mongo-paged-result.model';
import { APIResponseMeta } from './api-res-meta.model';
import { APIResponsePagination } from './api-res-pagination.model';

export interface IAPIResponse {
  meta: APIResponseMeta;
  pagination: APIResponsePagination;
  data: any;
}

@injectable()
export class APIResponse implements IAPIResponse {
  public static fromMongoPagedResult(mongoPagedResult: MongoPagedResult): APIResponse {
    const apiResponse = new APIResponse();
    apiResponse.pagination = APIResponsePagination.fromMongoPagedResult(mongoPagedResult);
    apiResponse.data = mongoPagedResult.results;
    return apiResponse;
  }

  public meta: any;
  public data: any;
  public pagination: any;

  constructor(_data?: any) {
    this.data = _data;
  }
}
