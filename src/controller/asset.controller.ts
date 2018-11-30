import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { AssetService } from '../service/asset.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/asset',
  MIDDLEWARE.Context,
  authorize()
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
  public async getAssets(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:assetId'
  )
  public async get(
    @requestParam('assetId') assetId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAsset(assetId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/exists/:assetId'
  )
  public async getAssetExists(
    @requestParam('assetId') assetId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssetExists(assetId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async query(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }
}
