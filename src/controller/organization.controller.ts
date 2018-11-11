import { Request } from 'express';
import { checkSchema, param } from 'express-validator/check';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  request,
  requestParam,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta, Organization } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import * as HttpStatus from 'http-status-codes';
import { ILogger } from '../interface/logger.inferface';
@controller('/organization', MIDDLEWARE.Authorized)
export class OrganizationController extends BaseController {
  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/', MIDDLEWARE.NodeAdmin)
  public async getOrganizations(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizations(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet(
    '/:organizationId',
    param('organizationId')
      .isInt()
      .toInt()
  )
  public async getOrganization(
    @requestParam('organizationId') organizationId: number
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganization(organizationId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet(
    '/:organizationId/accounts',
    param('organizationId')
      .isInt()
      .toInt()
  )
  public async getOrganizationAccounts(
    @requestParam('organizationId') organizationId: number
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationAccounts(organizationId);
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost(
    '/',
    ...checkSchema(Organization.validationSchema()),
    MIDDLEWARE.ValidateRequest,
    MIDDLEWARE.NodeAdmin
  )
  public async createOrganization(@request() req: Request): Promise<APIResponse> {
    try {
      await this.organizationService.createOrganization(Organization.fromRequest(req));
      const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization created');
      return APIResponse.withMeta(meta);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPut(
    '/:organizationId',
    param('organizationId')
      .isInt()
      .toInt()
  )
  public async updateOrganization(
    @requestParam('organizationId') organizationId: number,
    @request() req: Request
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.updateOrganization(
        organizationId,
        Organization.fromRequestForUpdate(req)
      );
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
