import { Request } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { BundleService } from '../service/bundle.service';
import { BaseController } from './base.controller';

@controller('/bundle', MIDDLEWARE.Authorized)
export class BundleController extends BaseController {
  constructor(@inject(TYPE.BundleService) private bundleService: BundleService) {
    super();
  }

  @httpGet('/')
  public async getBundles(req: Request): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:bundleId')
  public async getBundle(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundle(bundleId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/exists/:bundleId')
  public async getBundleExists(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundleExists(bundleId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/query', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async queryBundles(req: Request): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
