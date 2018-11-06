import { Request } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, request, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta, OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';

@controller('/organization/request')
export class OrganizationRequestController extends BaseController {
  constructor(@inject(TYPE.OrganizationService) private organizationService: OrganizationService) {
    super();
  }

  @httpGet('/', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async getOrganizationReguests(req: Request): Promise<APIResponse> {
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

  @httpGet('/:address', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async getOrganizationReguest(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequest(address);
      const apiResponse = APIResponse.fromSingleResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/', ...checkSchema(OrganizationRequest.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async createOrganizationReguest(@request() req: Request): Promise<APIResponse> {
    try {
      const apiResponse = new APIResponse();
      await this.organizationService.createOrganizationRequest(
        OrganizationRequest.fromRequest(req)
      );
      apiResponse.meta = new APIResponseMeta(200);
      apiResponse.meta.message = 'Organization request created';
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
