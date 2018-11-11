import { Request } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, request, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta, OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import * as HttpStatus from 'http-status-codes';
import { ILogger } from '../interface/logger.inferface';
@controller('/organization/request', MIDDLEWARE.Authorized)
export class OrganizationRequestController extends BaseController {
  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async getOrganizationReguests(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequests(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:address', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async getOrganizationReguest(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequest(address);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/', ...checkSchema(OrganizationRequest.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async createOrganizationReguest(@request() req: Request): Promise<APIResponse> {
    try {
      await this.organizationService.createOrganizationRequest(
        OrganizationRequest.fromRequest(req)
      );
      const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization request created');
      return APIResponse.withMeta(meta);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
