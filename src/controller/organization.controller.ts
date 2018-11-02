import { Request, Response } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';

@controller('/organization', MIDDLEWARE.Authorized)
export class OrganizationController extends BaseController {
  constructor(@inject(TYPE.OrganizationService) private organizationService: OrganizationService) {
    super();
  }

  @httpGet('/', MIDDLEWARE.NodeAdmin)
  public async getOrganizations(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizations(
        APIQuery.fromRequest(req)
      );
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/request', MIDDLEWARE.NodeAdmin)
  public async getOrgReguests(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequests(
        APIQuery.fromRequest(req)
      );
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/request/:address', MIDDLEWARE.NodeAdmin)
  public async getOrgReguest(@requestParam('address') address: string): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequest(address);
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
  @httpPost(
    '/request',
    ...checkSchema(OrganizationRequest.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async createOrgReguest(
    @request() req: Request,
    @response() res: Response
  ): Promise<APIResponse> {
    try {
      const apiResponse = new APIResponse();
      await this.organizationService.createOrganizationRequest(
        OrganizationRequest.fromRequest(req)
      );
      apiResponse.meta.message = 'Organization request created';
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
