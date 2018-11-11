import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { AssetService } from '../service/asset.service';
import { BaseController } from './base.controller';
import { ILogger } from '../interface/logger.inferface';
@controller('/asset', MIDDLEWARE.Authorized)
export class AssetController extends BaseController {
  constructor(
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/')
  public async getAssets(req: Request): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:assetId')
  public async get(@requestParam('assetId') assetId: string): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAsset(assetId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/exists/:assetId')
  public async getAssetExists(@requestParam('assetId') assetId: string): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssetExists(assetId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
