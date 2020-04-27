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
  httpGet,
  httpPost,
  requestParam,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';

import {
  APIQuery,
  APIResponse,
  APIResponseMeta,
  OrganizationRequest,
  UserPrincipal
} from '../model';

import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { organizationSchema, utilSchema } from '../validation';
import { AccountService } from '../service/account.service';
import { BuiltInService } from '../service/builtin.service';
import { ThrottlingService } from '../service/throttling.service';

import { AuthenticationError } from '../errors';

@controller(
  '/organization/request',
  MIDDLEWARE.Context
)
export class OrganizationRequestController extends BaseController {

  constructor(
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.BuiltInService) private builtInService: BuiltInService,
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService,
    @inject(TYPE.ThrottlingService) private throttlingService: ThrottlingService,
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal
  ) {
    super(logger);
  }

  @httpGet(
    '/',
    authorize('super_account')
  )
  public async getOrganizationReguests(req: Request): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizationRequests(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/refused',
    authorize('super_account')
  )
  public async getOrganizationReguestsRefused(req: Request): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizationRequestsRefused(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:address',
    authorize('super_account'),
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async getOrganizationReguest(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizationRequest(address);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/:address/approve',
    authorize('super_account'),
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async organizationRequestApprove(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    await this.organizationService.organizationRequestApprove(address);

    const meta = new APIResponseMeta(
      HttpStatus.ACCEPTED,
      'Organization request approval complete'
    );

    return APIResponse.withMeta(meta);
  }

  @httpGet(
    '/:address/refuse',
    authorize('super_account'),
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async organizationRequestRefuse(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    await this.organizationService.organizationRequestRefuse(address);
    const meta = new APIResponseMeta(
      HttpStatus.ACCEPTED,
      'Organization request refusal complete'
    );
    return APIResponse.withMeta(meta);
  }

  @httpPost(
    '/',
    validate(organizationSchema.organizationRequest)
  )
  public async createOrganizationReguest(req: Request): Promise<APIResponse> {
    if (config.test.mode === 1) {
      const throttling = await this.throttlingService.check(this.throttlingService.addressFromRequest(req), 'organization');

      if (throttling > 0) {
        throw new AuthenticationError({reason: `too fast, must wait ${throttling} seconds`});
      }
    }

    await this.organizationService.createOrganizationRequest(
      OrganizationRequest.fromRequest(req)
    );

    let meta: APIResponseMeta;

    if (config.test.mode === 1) {
      const address = req.body['address'];

      const builtIn = await this.builtInService.getBuiltInAddress();

      this.user.account = await this.accountService.getAccountForAuth(builtIn);

      await this.organizationService.organizationRequestApprove(address);

      await this.throttlingService.update(req.connection.remoteAddress, 'organization');

      meta = new APIResponseMeta(
        HttpStatus.ACCEPTED,
        'Organization: request approval complete'
      );
    } else {
      meta = new APIResponseMeta(
        HttpStatus.CREATED,
        'Organization: request created'
      );
    }

    return APIResponse.withMeta(meta);
  }
}
