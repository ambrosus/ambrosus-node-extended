import { Request, Response, NextFunction } from 'express';
import { checkSchema, param, body } from 'express-validator/check';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  request,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta, Organization } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/organization',
  MIDDLEWARE.Context,
  authorize()
)
export class OrganizationController extends BaseController {

  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/',
    authorize('super_account')
  )
  public async getOrganizations(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizations(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:organizationId',
    param('organizationId')
      .isInt()
      .toInt()
  )
  public async getOrganization(
    @requestParam('organizationId') organizationId: number,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganization(organizationId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:organizationId/accounts',
    authorize('manage_accounts'),
    param('organizationId')
      .isInt()
      .toInt()
  )
  public async getOrganizationAccounts(
    @requestParam('organizationId') organizationId: number,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationAccounts(organizationId);
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/',
    authorize('super_account'),
    ...checkSchema(Organization.validationSchema())
  )
  public async createOrganization(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      await this.organizationService.createOrganization(Organization.fromRequest(req));
      const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization created');
      return APIResponse.withMeta(meta);
    } catch (err) {
      next(err);
    }
  }

  @httpPut(
    '/:organizationId',
    authorize('manage_accounts'),
    param('organizationId')
      .isInt()
      .toInt(),
    ...checkSchema(Organization.validationSchema(true))
  )
  public async updateOrganization(
    @requestParam('organizationId') organizationId: number,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.updateOrganization(
        organizationId,
        Organization.fromRequestForUpdate(req)
      );
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }
}
