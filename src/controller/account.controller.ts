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

import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  requestBody,
  requestParam,
  requestHeaders,
} from 'inversify-express-utils';

import { Permission } from '../constant/';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { AccountDetail, APIQuery, APIResponse } from '../model';
import { AccountService } from '../service/account.service';
import { Web3Service } from '../service/web3.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema, utilSchema, accountSchema } from '../validation/schemas';
import { AuthService } from '../service/auth.service';

@controller(
  '/account',
  MIDDLEWARE.Context
)
export class AccountController extends BaseController {

  constructor(
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service,
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AuthService) private authService: AuthService
  ) {
    super(logger);
  }

  @httpGet(
    '/keyPair'
  )
  public async getKeyPair(): Promise<APIResponse> {
    const result = await this.web3Service.createKeyPair();
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/',
    authorize('super_account', 'manage_accounts'),
    validate(querySchema, { queryParamsOnly: true })
  )
  public async getAccounts(req: Request): Promise<APIResponse> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/:address',
    authorize(),
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async getAccount(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccount(address);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/:address/details'
  )
  public async getPublicAccountDetails(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    const result = await this.accountService.getPublicAccountDetails(address);

    return APIResponse.fromSingleResult(result);
  }

  @httpPut(
    '/:address',
    authorize(),
    validate(accountSchema.accountDetails, { params: true })
  )
  public async updateAccountDetail(
    @requestParam('address') address: string, req: Request
  ): Promise<APIResponse> {
    const result = await this.accountService.updateAccountDetail(
      address,
      AccountDetail.fromRequestForUpdate(req)
    );
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/:address/exists',
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async getAccountExists(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccountExists(address);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    authorize('super_account', 'manage_accounts'),
    validate(querySchema)
  )
  public async queryAccounts(req: Request): Promise<APIResponse> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpPost(
    '/secret',
    validate(utilSchema.email)
  )
  public async getEncryptedSecretByEmail(
    @requestBody() acc: AccountDetail
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccountEncryptedToken(acc.email);
    return APIResponse.fromSingleResult(result);
  }

 @httpPost(
    '/create',
    authorize('register_accounts'),
    validate(accountSchema.accountCreate)
  )
  public async createAccount(
    @requestHeaders('authorization') authorization: string,
    @requestBody() payload: {address, email, fullName, accessLevel, permissions}
    ): Promise<APIResponse> {
    const authToken = this.authService.getAuthToken(authorization);
    const creatorAccount = await this.accountService.getAccount(authToken.createdBy);

    if (payload.accessLevel === undefined) {
      payload.accessLevel = 0;
    }

    if (payload.permissions === undefined) {
      payload.permissions = [Permission.create_asset, Permission.create_event];
    }

    await this.accountService.createAccount(
      payload.address,
      payload.accessLevel,
      creatorAccount.organization,
      payload.permissions,
      payload.email,
      payload.fullName,
      creatorAccount.address
    );

    const result = await this.accountService.getAccount(payload.address);

    return APIResponse.fromSingleResult(result);
  }
}
