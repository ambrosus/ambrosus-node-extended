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
