import { Request } from 'express';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta, OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { organizationSchema, utilSchema } from '../validation';

@controller(
  '/organization/request',
  MIDDLEWARE.Context
)
export class OrganizationRequestController extends BaseController {

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
    await this.organizationService.createOrganizationRequest(
      OrganizationRequest.fromRequest(req)
    );
    const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization request created');
    return APIResponse.withMeta(meta);
  }
}
