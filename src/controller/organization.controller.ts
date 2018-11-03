import { Request, Response } from 'express';
import { checkSchema, param } from 'express-validator/check';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response,
  httpPut,
} from 'inversify-express-utils';
import web3 = require('web3');
import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, OrganizationRequest, Organization } from '../model';
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
      const result = await this.organizationService.getOrganizations(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet(
    '/:owner',
    param('owner').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getOrganization(@requestParam('owner') owner: string): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganization(owner);
      const apiResponse = new APIResponse(result);
      return apiResponse;
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
      const apiResponse = new APIResponse();
      await this.organizationService.createOrganization(Organization.fromRequest(req));
      apiResponse.meta.message = 'Organization created';
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPut(
    '/:owner',
    param('owner').custom(value => web3.utils.isAddress(value)),
    ...checkSchema(Organization.validationSchema()),
    MIDDLEWARE.ValidateRequest,
    MIDDLEWARE.NodeAdmin
  )
  public async updateOrganization(
    @requestParam('owner') owner: string,
    @request() req: Request
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.updateOrganization(
        owner,
        Organization.fromRequestForUpdate(req)
      );
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/request', MIDDLEWARE.NodeAdmin)
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

  @httpGet('/request/:address', MIDDLEWARE.NodeAdmin)
  public async getOrganizationReguest(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
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
  public async createOrganizationReguest(@request() req: Request): Promise<APIResponse> {
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
