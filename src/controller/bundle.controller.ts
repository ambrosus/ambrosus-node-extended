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
import { APIQuery, APIResult, Bundle } from '../model';
import { BundleService } from '../service/bundle.service';
import { NotFoundResult } from 'inversify-express-utils/dts/results';

@controller('/bundle', TYPES.AuthorizedMiddleware)
export class BundleController extends BaseHttpController {
  constructor(@inject(TYPES.BundleService) private bundleService: BundleService) {
    super();
  }

  @httpGet('/')
  public async getEvents(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpGet('/:bundleId')
  public async get(@requestParam('bundleId') bundleId: string): Promise<Bundle | NotFoundResult> {
    const result = await this.bundleService.getBundle(bundleId);
    if (!result) {
      return this.notFound();
    }
    return result;
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }
}
