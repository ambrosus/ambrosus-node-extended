import { Request } from 'express';
import { body } from 'express-validator/check';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestBody } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';

@controller('/organization/invite', MIDDLEWARE.Authorized)
export class OrganizationInviteController extends BaseController {
  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/', MIDDLEWARE.NodeAdmin)
  public async getOrganizations(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationInvites(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/', body('email').isArray(), body('email.*').isEmail(), MIDDLEWARE.ValidateRequest)
  public async createOrganizationInvite(@requestBody() reqBody: any): Promise<APIResponse> {
    try {
      const result = await this.organizationService.createOrganizationInvites(reqBody.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost(
    '/resend',
    body('email').isArray(),
    body('email.*').isEmail(),
    MIDDLEWARE.ValidateRequest
  )
  public async resendOrganizationInviteEmails(@requestBody() reqBody: any): Promise<APIResponse> {
    try {
      const result = await this.organizationService.resendOrganizationInviteEmails(reqBody.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
