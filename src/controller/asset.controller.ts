import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestParam,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { AssetService } from '../service/asset.service';

@controller('/asset', MIDDLEWARE.Authorized)
export class AssetController {
  constructor(@inject(TYPE.AssetService) private assetService: AssetService) {}

  @httpGet('/')
  public async getAssets(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/:assetId')
  public async get(@requestParam('assetId') assetId: string): Promise<APIResponse> {
    const result = await this.assetService.getAsset(assetId);
    const apiResponse = new APIResponse(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/exists/:assetId')
  public async getAssetExists(@requestParam('assetId') assetId: string): Promise<APIResponse> {
    const result = await this.assetService.getAssetExists(assetId);
    const apiResponse = new APIResponse();
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.exists = result;
    return apiResponse;
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }
}
