import { Request, Response, NextFunction } from 'express';
import { body, checkSchema, param } from 'express-validator/check';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  request,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import web3 = require('web3');

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { AccountDetail, APIQuery, APIResponse } from '../model';
import { AccountService } from '../service/account.service';
import { Web3Service } from '../service/web3.service';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/account',
  MIDDLEWARE.Context
)
export class AccountController extends BaseController {

  constructor(
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/keyPair'
  )
  public async getKeyPair(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.web3Service.createKeyPair();
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/',
    authorize('super_account', 'manage_accounts'),
    ...checkSchema(APIQuery.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccounts(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:address',
    authorize(),
    param('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccount(
    @requestParam('address') address: string, req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccount(address);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPut(
    '/:address',
    authorize(),
    param('address').custom(value => web3.utils.isAddress(value)),
    ...checkSchema(AccountDetail.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async updateAccountDetail(
    @requestParam('address') address: string, req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.accountService.updateAccountDetail(
        address,
        AccountDetail.fromRequestForUpdate(req)
      );
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet(
    '/:address/exists',
    param('address').custom(value => web3.utils.isAddress(value)),
    MIDDLEWARE.ValidateRequest
  )
  public async getAccountExists(
    @requestParam('address') address: string, req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccountExists(address);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/query',
    authorize('super_account', 'manage_accounts'),
    ...checkSchema(APIQuery.validationSchema()),
    MIDDLEWARE.ValidateRequest
  )
  public async queryAccounts(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost(
    '/secret',
    body('email').isEmail(),
    MIDDLEWARE.ValidateRequest
  )
  public async getEncryptedSecretByEmail(
    @requestBody() acc: AccountDetail, req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.accountService.getAccountEncryptedToken(acc.email);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }
}
