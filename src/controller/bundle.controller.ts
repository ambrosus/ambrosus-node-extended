import { Request } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse } from '../model';
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
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:bundleId')
  public async getBundle(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundle(bundleId);
      const apiResponse = APIResponse.fromSingleResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/exists/:bundleId')
  public async getBundleExists(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundleExists(bundleId);
      const apiResponse = new APIResponse();
      apiResponse.meta.exists = result;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/query', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async queryBundles(req: Request): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
