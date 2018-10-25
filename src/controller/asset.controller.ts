import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestParam,
} from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { APIQuery, APIResult, Asset } from '../model';
import { AssetService } from '../service/asset.service';

@controller('/asset', TYPES.AuthorizedMiddleware)
export class AssetController extends BaseHttpController {
  constructor(@inject(TYPES.AssetService) private assetService: AssetService) {
    super();
  }

  @httpGet('/')
  public getAssets(req: Request): Promise<APIResult> {
    return this.assetService.getAssets(APIQuery.fromRequest(req));
  }

  @httpGet('/:assetId')
  public get(@requestParam('assetId') assetId: string): Promise<Asset> {
    return this.assetService.getAsset(assetId);
  }

  @httpPost('/query')
  public query(req: Request): Promise<APIResult> {
    return this.assetService.getAssets(APIQuery.fromRequest(req));
  }
}
