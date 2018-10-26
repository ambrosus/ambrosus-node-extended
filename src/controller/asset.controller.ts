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
import { NotFoundResult } from 'inversify-express-utils/dts/results';

@controller('/asset', TYPES.AuthorizedMiddleware)
export class AssetController extends BaseHttpController {
  constructor(@inject(TYPES.AssetService) private assetService: AssetService) {
    super();
  }

  @httpGet('/')
  public async getAssets(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpGet('/:assetId')
  public async get(@requestParam('assetId') assetId: string): Promise<Asset | NotFoundResult> {
    const result = await this.assetService.getAsset(assetId);
    if (!result) {
      return this.notFound();
    }
    return result;
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    if (!result) {
      return this.notFound();
    }
    return result;
  }
}
