import { Request, Response, NextFunction } from 'express';
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
import { authorize } from '../middleware/authorize.middleware';

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
  public async getOrganizationInvites(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationInvites(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:inviteId/exists')
  public async getOrganizationInviteVerification(
    @requestParam('inviteId') inviteId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.organizationInviteExists(inviteId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/:inviteId/accept',
    authorize('super_account'),
    body('address').custom(value => web3.utils.isAddress(value))
  )
  public async acceptOrganizationInvite(
    @requestParam('inviteId') inviteId: string,
    @requestBody() invite: any,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.acceptOrganizationInvite(
        inviteId,
        invite.address
      );
      return APIResponse.fromSingleResult(result, { message: 'Account created' });
    } catch (err) {
      next(err);
    }
  }

  @httpDelete(
    '/:inviteId',
    authorize('super_account')
  )
  public async deleteOrganizationInvite(
    @requestParam('inviteId') inviteId: string,
    req: Request, res: Response, next: NextFunction
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
      next(err);
    }
  }

  @httpPost(
    '/',
    authorize('super_account'),
    body('email').isArray(),
    body('email.*').isEmail()
  )
  public async createOrganizationInvite(
    @requestBody() reqBody: any,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.createOrganizationInvites(reqBody.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/resend',
    authorize('super_account'),
    body('email').isArray(),
    body('email.*').isEmail()
  )
  public async resendOrganizationInviteEmails(
    @requestBody() reqBody: any,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.resendOrganizationInvites(reqBody.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }
}
