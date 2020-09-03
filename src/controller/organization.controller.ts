/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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

import { Request } from 'express';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta, Organization } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { utilSchema, organizationSchema } from '../validation';

@controller(
  '/organization',
  MIDDLEWARE.Context,
  authorize()
)
export class OrganizationController extends BaseController {

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
  public async getOrganizations(req: Request): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizations(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:organizationId',
    validate(utilSchema.organizationId, { paramsOnly: true })
  )
  public async getOrganization(
    @requestParam('organizationId') organizationId: number
  ): Promise<APIResponse> {
    const result = await this.organizationService.getOrganization(organizationId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/:organizationId/accounts',
    authorize('manage_accounts'),
    validate(utilSchema.organizationId, { paramsOnly: true })
  )
  public async getOrganizationAccounts(
    @requestParam('organizationId') organizationId: number
  ): Promise<APIResponse> {
    const result = await this.organizationService.getOrganizationAccounts(organizationId);
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpPost(
    '/',
    authorize('super_account'),
    validate(organizationSchema.organizationCreate)
  )
  public async createOrganization(req: Request): Promise<APIResponse> {
    await this.organizationService.createOrganization(Organization.fromRequest(req));
    const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization created');

    return APIResponse.withMeta(meta);
  }

  @httpPut(
    '/:organizationId',
    authorize('manage_accounts'),
    validate(organizationSchema.organizationUpdate, { params: true })
  )
  public async updateOrganization(
    @requestParam('organizationId') organizationId: number,
    req: Request
  ): Promise<APIResponse> {
    const result = await this.organizationService.updateOrganization(
      organizationId,
      Organization.fromRequestForUpdate(req)
    );
    return APIResponse.fromSingleResult(result);
  }
}
