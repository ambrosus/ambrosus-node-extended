import { Request, Response } from 'express';
import { checkSchema, param } from 'express-validator/check';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response,
} from 'inversify-express-utils';
import web3 = require('web3');

import { MIDDLEWARE, TYPE } from '../constant/types';
import { APIQuery, APIResponse, APIResponseMeta } from '../model';
import { AccountService } from '../service/account.service';

@controller('/account', MIDDLEWARE.Authorized)
export class AccountController {
  constructor(@inject(TYPE.AccountService) private accountService: AccountService) {}

  @httpGet('/', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async getAccounts(
    @request() req: Request,
    @response() res: Response
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }

  @httpGet(
    '/:address',
    param('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccount(
    @requestParam('address') address: string,
    @response() res: Response
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccount(address);
    const apiResponse = new APIResponse(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
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
    const result = await this.accountService.getAccountExists(address);
    const apiResponse = new APIResponse();
    apiResponse.meta = new APIResponseMeta(200);
    apiResponse.meta.exists = result;
    return apiResponse;
  }

  @httpPost('/query', ...checkSchema(APIQuery.validationSchema()), MIDDLEWARE.ValidateRequest)
  public async queryAccounts(req: Request): Promise<APIResponse> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    const apiResponse = APIResponse.fromMongoPagedResult(result);
    apiResponse.meta = new APIResponseMeta(200);
    return apiResponse;
  }
}
