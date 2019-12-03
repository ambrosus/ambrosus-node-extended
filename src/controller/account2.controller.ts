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
  requestBody,
  requestParam,
  requestHeaders,
} from 'inversify-express-utils';

import { Permission } from '../constant/';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { Web3Service } from '../service/web3.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema, utilSchema, accountSchema } from '../validation/schemas';
import { AccountService } from '../service/account.service';
import { AuthService } from '../service/auth.service';

import { ValidationError } from '../errors';

@controller(
  '/account2',
  MIDDLEWARE.Context
)

export class Account2Controller extends BaseController {

  constructor(
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AuthService) private authService: AuthService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service
  ) {
    super(logger);
  }

  @httpGet(
    '/list',
    authorize('manage_accounts'),
    validate(querySchema, { queryParamsOnly: true })
  )
  public async getAccounts(req: Request): Promise<APIResponse> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/info/:address',
    authorize(),
    validate(utilSchema.address, { paramsOnly: true })
  )
  public async getAccount(
    @requestParam('address') address: string
  ): Promise<APIResponse> {
    const result = await this.accountService.getAccount2(address);
    return APIResponse.fromSingleResult(result);
  }

 @httpPost(
    '/create/:address',
    authorize('register_accounts'),
    validate(accountSchema.accountCreate)
  )
  public async createAccount(
    @requestParam('address') address: string,
    @requestHeaders('authorization') authorization: string,
    @requestBody() payload: {email: string, fullName: string, accessLevel: number, permissions: string[]}
    ): Promise<APIResponse> {

    if (!(await this.web3Service.isAddress(address))) {
      throw new ValidationError( {reason: 'invalid address.'} );
    }

    const authToken = this.authService.getAuthToken(authorization);
    const creatorAccount = await this.accountService.getAccount(authToken.createdBy);

    if (payload.accessLevel === undefined) {
      payload.accessLevel = 0;
    }

    if (payload.permissions === undefined) {
      payload.permissions = [Permission.create_asset, Permission.create_event];
    }

    await this.accountService.createAccount(
      address,
      payload.accessLevel,
      creatorAccount.organization,
      payload.permissions,
      payload.email,
      payload.fullName,
      creatorAccount.address
    );

    const result = await this.accountService.getAccount(address);

    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/modify/:address',
    authorize('manage_accounts'),
    validate(accountSchema.accountCreate)
  )
  public async modifyAccount(
    @requestParam('address') address: string,
    @requestBody() payload: {active: boolean, accessLevel: number, permissions: string[]}
    ): Promise<APIResponse> {

    if (!(await this.web3Service.isAddress(address))) {
      throw new ValidationError( {reason: 'invalid address.'} );
    }

    await this.accountService.modifyAccount(
      address,
      payload.active,
      payload.accessLevel,
      payload.permissions
    );

    const result = await this.accountService.getAccount(address);

    return APIResponse.fromSingleResult(result);
  }
}
