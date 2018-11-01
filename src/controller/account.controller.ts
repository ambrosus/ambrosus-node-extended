import { Request, Response } from 'express';
import { checkSchema, param } from 'express-validator/check';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response,
} from 'inversify-express-utils';
import web3 = require('web3');

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse } from '../model';
import { AccountService } from '../service/account.service';
import { BaseController } from './base.controller';

@controller('/account', MIDDLEWARE.Authorized)
export class AccountController extends BaseController {
  constructor(@inject(TYPE.AccountService) private accountService: AccountService) {
    super();
  }

  @httpGet('/', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async getAccounts(@request() req: Request): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet(
    '/:address',
    param('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccount(@requestParam('address') address: string): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccount(address);
      const apiResponse = new APIResponse(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpGet(
    '/exists/:address',
    param('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccountExists(
    @requestParam('address') address: string,
    @response() res: Response
  ): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccountExists(address);
      const apiResponse = new APIResponse();
      apiResponse.meta.exists = result;
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }

  @httpPost('/query', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async queryAccounts(req: Request): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
      const apiResponse = APIResponse.fromMongoPagedResult(result);
      return apiResponse;
    } catch (err) {
      return super.handleError(err);
    }
  }
}
