import { Request } from 'express';
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
import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { utilSchema, organizationSchema } from '../validation';

@controller(
  '/organization/invite',
  MIDDLEWARE.Context
)
export class OrganizationInviteController extends BaseController {

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
  public async getOrganizationInvites(req: Request): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizationInvites(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:inviteId/exists'
  )
  public async getOrganizationInviteVerification(
    @requestParam('inviteId') inviteId: string
  ): Promise<APIResponse> {
    const result = await this.organizationService.organizationInviteExists(inviteId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/:inviteId/accept',
    authorize('super_account'),
    validate(utilSchema.address)
  )
  public async acceptOrganizationInvite(
    @requestParam('inviteId') inviteId: string,
    @requestBody() invite: any
  ): Promise<APIResponse> {
    const result = await this.organizationService.acceptOrganizationInvite(
      inviteId,
      invite.address
    );
    return APIResponse.fromSingleResult(result, { message: 'Account created' });
  }

  @httpDelete(
    '/:inviteId',
    authorize('super_account')
  )
  public async deleteOrganizationInvite(
    @requestParam('inviteId') inviteId: string
  ): Promise<APIResponse> {
    const deleteOp = await this.organizationService.deleteOrganizationInvite(inviteId);

    const meta = new APIResponseMeta(
      HttpStatus.OK,
      deleteOp.result.n > 0 ? 'Delete successful' : 'Nothing to delete'
    );
    meta['deleted'] = deleteOp.result.n;
    return APIResponse.withMeta(meta);
  }

  @httpPost(
    '/',
    authorize('super_account'),
    validate(organizationSchema.organizationInvites)
  )
  public async createOrganizationInvite(
    @requestBody() reqBody: any
  ): Promise<APIResponse> {
    const result = await this.organizationService.createOrganizationInvites(reqBody.email);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/resend',
    authorize('super_account'),
    validate(organizationSchema.organizationInvites)
  )
  public async resendOrganizationInviteEmails(
    @requestBody() reqBody: any
  ): Promise<APIResponse> {
    const result = await this.organizationService.resendOrganizationInvites(reqBody.email);
    return APIResponse.fromSingleResult(result);
  }
}
