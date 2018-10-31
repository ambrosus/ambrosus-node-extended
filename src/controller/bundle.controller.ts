import { Request } from 'express';
import { checkSchema } from 'express-validator/check';
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
import { BundleService } from '../service/bundle.service';

@controller('/bundle', MIDDLEWARE.Authorized)
export class BundleController {
  constructor(@inject(TYPE.BundleService) private bundleService: BundleService) {}

  @httpGet('/')
  public async getBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/:bundleId')
  public async getBundle(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    const result = await this.bundleService.getBundle(bundleId);
    const apiResponse = new APIResponse(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet('/exists/:bundleId')
  public async getBundleExists(@requestParam('bundleId') bundleId: string): Promise<APIResponse> {
    const result = await this.bundleService.getBundleExists(bundleId);
    const apiResponse = new APIResponse();
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.exists = result;
    return apiResponse;
  }

  @httpPost('/query', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async queryBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }
}
