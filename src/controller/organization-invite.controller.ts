/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { config } from '../config';

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
import { ThrottlingService } from '../service/throttling.service';

import { AuthenticationError } from '../errors';

@controller(
  '/organization/invite',
  MIDDLEWARE.Context
)
export class OrganizationInviteController extends BaseController {

  constructor(
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.ThrottlingService) private throttlingService: ThrottlingService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/',
    authorize('manage_accounts')
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
    authorize('manage_accounts')
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
    authorize('manage_accounts'),
    validate(organizationSchema.organizationInvites)
  )
  public async createOrganizationInvite(req: Request): Promise<APIResponse> {
    if (Number.parseInt(config.test.mode, 10) === 1) {
      const throttling = await this.throttlingService.check(req.connection.remoteAddress, 'account');

      if (throttling > 0) {
        throw new AuthenticationError({reason: `too fast, must wait ${throttling} seconds`});
      }
    }

    await this.throttlingService.update(req.connection.remoteAddress, 'account');

    const result = await this.organizationService.createOrganizationInvites(req.body['email']);

    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/resend',
    authorize('manage_accounts'),
    validate(organizationSchema.organizationInvites)
  )
  public async resendOrganizationInviteEmails(
    @requestBody() reqBody: any
  ): Promise<APIResponse> {
    const result = await this.organizationService.resendOrganizationInvites(reqBody.email);
    return APIResponse.fromSingleResult(result);
  }
}
