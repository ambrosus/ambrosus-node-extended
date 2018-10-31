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
import { APIQuery, APIResult, OrganizationRequest } from '../model';
import { APISuccess } from '../model/api/api-success.model';
import { OrganizationService } from '../service/organization.service';

@controller('/organization', MIDDLEWARE.Authorized)
export class OrganizationController {
  constructor(@inject(TYPE.OrganizationService) private organizationService: OrganizationService) {}

  @httpGet('/request', MIDDLEWARE.NodeAdmin)
  public async getOrgReguests(req: Request): Promise<APIResult> {
    const result = await this.organizationService.getOrgRequests(APIQuery.fromRequest(req));
    return result;
  }

  @httpGet('/request/:address', MIDDLEWARE.NodeAdmin)
  public async getOrgReguest(
    @requestParam('address') address: string
  ): Promise<OrganizationRequest> {
    const result = await this.organizationService.getOrgRequest(address);
    return result;
  }

  @httpPost(
    '/request',
    ...checkSchema(OrganizationRequest.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async createOrgReguest(@request() req: Request, @response() res: Response): Promise<any> {
    await this.organizationService.createOrgRequest(OrganizationRequest.fromRequest(req));
    return res.status(201).json(new APISuccess('Create request'));
  }
}
