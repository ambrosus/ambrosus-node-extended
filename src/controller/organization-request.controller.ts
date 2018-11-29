import { Request, Response, NextFunction } from 'express';
import { checkSchema } from 'express-validator/check';
import * as HttpStatus from 'http-status-codes';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, request, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse, APIResponseMeta, OrganizationRequest } from '../model';
import { OrganizationService } from '../service/organization.service';
import { BaseController } from './base.controller';

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
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async getOrganizationReguests(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequests(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/refused',
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async getOrganizationReguestsRefused(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequestsRefused(
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:address',
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async getOrganizationReguest(
    @requestParam('address') address: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.organizationService.getOrganizationRequest(address);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:address/approve',
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async organizationRequestApprove(
    @requestParam('address') address: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      await this.organizationService.organizationRequestApprove(address);
      const meta = new APIResponseMeta(
        HttpStatus.ACCEPTED,
        'Organization request approval complete'
      );
      return APIResponse.withMeta(meta);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:address/refuse',
    MIDDLEWARE.Authorized,
    MIDDLEWARE.NodeAdmin
  )
  public async organizationRequestRefuse(
    @requestParam('address') address: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      await this.organizationService.organizationRequestRefuse(address);
      const meta = new APIResponseMeta(
        HttpStatus.ACCEPTED,
        'Organization request refusal complete'
      );
      return APIResponse.withMeta(meta);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/',
    ...checkSchema(OrganizationRequest.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async createOrganizationReguest(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      await this.organizationService.createOrganizationRequest(
        OrganizationRequest.fromRequest(req)
      );
      const meta = new APIResponseMeta(HttpStatus.CREATED, 'Organization request created');
      return APIResponse.withMeta(meta);
    } catch (err) {
      next(err);
    }
  }
}
