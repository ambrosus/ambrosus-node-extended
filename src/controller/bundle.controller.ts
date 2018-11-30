import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { BundleService } from '../service/bundle.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema } from '../validation';

@controller(
  '/bundle',
  MIDDLEWARE.Context,
  authorize()
)
export class BundleController extends BaseController {

  constructor(
    @inject(TYPE.BundleService) private bundleService: BundleService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/'
  )
  public async getBundles(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:bundleId'
  )
  public async getBundle(
    @requestParam('bundleId') bundleId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundle(bundleId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/exists/:bundleId'
  )
  public async getBundleExists(
    @requestParam('bundleId') bundleId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundleExists(bundleId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async queryBundles(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.bundleService.getBundles(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }
}
