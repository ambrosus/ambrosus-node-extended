import { Request, Response } from 'express';
import { checkSchema } from 'express-validator/check';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpPost,
  httpGet,
  response,
  request,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { APISuccess } from '../model/api/api-success.model';

@controller('/organization', MIDDLEWARE.Authorized)
export class OrganizationController extends BaseHttpController {
  constructor(@inject(TYPE.OrganizationService) private organizationService: OrganizationService) {
    super();
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
