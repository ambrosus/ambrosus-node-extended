// Based on https://www.instagram.com/developer/endpoints/
import { injectable } from 'inversify';

import { MongoPagedResult } from '../query/mongo-paged-result.model';
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
    console.log(mongoPagedResult);
    const apiResponse = new APIResponse();

    apiResponse.pagination = APIResponsePagination.fromMongoPagedResult(mongoPagedResult);
    apiResponse.data = mongoPagedResult.results || [];
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.count = apiResponse.data.length;
    return apiResponse;
  }

  public meta: any;
  public data: any;
  public pagination: any;

  constructor(_data?: any) {
    this.data = _data;
    this.meta = new APIResponseMeta(200);
    if (this.data) {
      this.meta.count = this.data.length;
    }
  }
}
