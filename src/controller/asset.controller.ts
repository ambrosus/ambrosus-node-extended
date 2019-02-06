import { Request } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AssetService } from '../service/asset.service';
import { BaseController } from './base.controller';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/asset',
  MIDDLEWARE.Context
)
export class AssetController extends BaseController {

  constructor(
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/'
  )
  public async getAssets(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:assetId'
  )
  public async get(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAsset(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/exists/:assetId'
  )
  public async getAssetExists(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAssetExists(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async query(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }
}
