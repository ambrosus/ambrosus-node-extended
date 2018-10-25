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

@controller('/bundle', TYPES.AuthorizedMiddleware)
export class BundleController extends BaseHttpController {
  constructor(@inject(TYPES.BundleService) private bundleService: BundleService) {
    super();
  }

  @httpGet('/')
  public getEvents(req: Request): Promise<APIResult> {
    return this.bundleService.getBundles(APIQuery.fromRequest(req));
  }

  @httpGet('/:bundleId')
  public get(@requestParam('bundleId') bundleId: string): Promise<Bundle> {
    return this.bundleService.getBundle(bundleId);
  }

  @httpPost('/query')
  public query(req: Request): Promise<APIResult> {
    return this.bundleService.getBundles(APIQuery.fromRequest(req));
  }
}
