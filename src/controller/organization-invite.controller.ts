import { Request } from 'express';
import { body } from 'express-validator/check';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import web3 = require('web3');
import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';

@controller('/organization/invite')
export class OrganizationInviteController extends BaseController {
  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async getOrganizationInvites(req: Request): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationInvites(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet('/:inviteId/exists')
  public async getOrganizationInviteVerification(
    @requestParam('inviteId') inviteId: string
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.organizationInviteExists(inviteId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost(
    '/:inviteId/accept',
    body('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async acceptOrganizationInvite(
    @requestParam('inviteId') inviteId: string,
    @requestBody() invite: any
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.acceptOrganizationInvite(
        inviteId,
        invite.address
      );
      return APIResponse.fromSingleResult(result, {message: 'Account created'});
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpDelete('/:inviteId', MIDDLEWARE.Authorized, MIDDLEWARE.NodeAdmin)
  public async deleteOrganizationInvite(
    @requestParam('inviteId') inviteId: string
  ): Promise<APIResponse> {
    try {
      const deleteOp = await this.organizationService.deleteOrganizationInvite(inviteId);

      const meta = new APIResponseMeta(
        HttpStatus.OK,
        deleteOp.result.n > 0 ? 'Delete successful' : 'Nothing to delete'
      );
      meta['deleted'] = deleteOp.result.n;
      return APIResponse.withMeta(meta);
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost(
    '/',
    body('email').isArray(),
    body('email.*').isEmail(),
    MIDDLEWARE.ValidateRequest,
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
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
    MIDDLEWARE.ValidateRequest,
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async resendOrganizationInviteEmails(@requestBody() reqBody: any): Promise<APIResponse> {
    try {
      const result = await this.organizationService.resendOrganizationInvites(reqBody.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      return super.handleError(err);
    }
  }
}
