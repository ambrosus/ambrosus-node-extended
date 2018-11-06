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
    const apiResponse = new APIResponse();

    apiResponse.pagination = APIResponsePagination.fromMongoPagedResult(mongoPagedResult);
    apiResponse.data = mongoPagedResult.results || [];
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.count = apiResponse.data.length;
    return apiResponse;
  }

  public static fromSingleResult(result: any): APIResponse {
    const apiResponse = new APIResponse();
    if (result) {
      apiResponse.data = result;
      apiResponse.meta = new APIResponseMeta(200);
    } else {
      apiResponse.meta = new APIResponseMeta(400);
      apiResponse.meta.message = 'No results found';
    }
    return apiResponse;
  }

  public meta: any;
  public data: any;
  public pagination: any;
}
