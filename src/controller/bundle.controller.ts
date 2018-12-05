import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { validate } from '../middleware';
import { authorize } from '../middleware/authorize.middleware';
import { APIQuery, APIResponse } from '../model';
import { BundleService } from '../service/bundle.service';
import { querySchema } from '../validation';
import { BaseController } from './base.controller';

@controller('/bundle', MIDDLEWARE.Context, authorize())
export class BundleController extends BaseController {
  constructor(
    @inject(TYPE.BundleService) private bundleService: BundleService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/')
  public async getBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet('/:bundleId')
  public async getBundle(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    const result = await this.bundleService.getBundle(bundleId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet('/exists/:bundleId')
  public async getBundleExists(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    const result = await this.bundleService.getBundleExists(bundleId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost('/query', validate(querySchema))
  public async queryBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }
}
