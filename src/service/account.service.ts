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

import { inject, injectable } from 'inversify';

import { Permission, TYPE } from '../constant/';
import {
  AccountDetailRepository,
  AccountRepository,
  OrganizationRepository
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  Account,
  AccountDetail,
  APIQuery,
  MongoPagedResult,
  UserPrincipal
} from '../model';
import { getTimestamp } from '../util';

import { ExistsError, PermissionError, NotFoundError } from '../errors';
import * as _ from 'lodash';

import {
  ensureCanCreateAccount,
  ensureCanModifyAccount
} from '../security/access.check';

@injectable()
export class AccountService {

  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.AccountRepository)
    private readonly accountRepository: AccountRepository,
    @inject(TYPE.OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @inject(TYPE.AccountDetailRepository)
    private readonly accountDetailRepository: AccountDetailRepository,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) { }

  public async createAccount(
    address: string,
    accessLevel: number,
    organizationId: number,
    permissions: string[],
    email: string,
    fullName: string,
    createdBy: string
  ) {
    if (await this.getAccountExists(address)) {
      throw new ExistsError({
        reason: 'An account already exists with this address',
      });
    }
    if (await this.getAccountExistsForEmail(email)) {
      throw new ExistsError({
        reason: 'An account already exists with this email',
      });
    }

    const newAccount = new Account();
    newAccount.address = address;
    newAccount.accessLevel = accessLevel;
    newAccount.organization = organizationId;
    newAccount.permissions = permissions;
    newAccount.registeredBy = createdBy;
    newAccount.registeredOn = getTimestamp();
    newAccount.active = true;

    const creator = await this.accountRepository.getAccount(new APIQuery({address: createdBy}), 0, 1000, true);

    await ensureCanCreateAccount(this.organizationRepository, creator, newAccount);

    const newAccountDetail = new AccountDetail();
    newAccountDetail.address = address;
    newAccountDetail.email = email;
    newAccountDetail.fullName = fullName;
    newAccountDetail.createdBy = createdBy;
    newAccountDetail.createdOn = getTimestamp();

    try {
      await this.accountRepository.create(newAccount);
      await this.accountDetailRepository.create(newAccountDetail);
    } catch (error) {
      this.logger.captureError(error);
      throw error;
    }
  }

  public async modifyAccount(
    address: string,
    active: boolean,
    accessLevel: number,
    permissions: string[]
  ) {
    const modifier = await this.accountRepository.getAccount(new APIQuery({address: this.user.authToken.createdBy}), 0, 1000, true);
    const target = await this.accountRepository.getAccount(new APIQuery({address}), 0, 1000, true);

    await ensureCanModifyAccount(this.organizationRepository, modifier, target, accessLevel, permissions);

    if (active !== undefined) {
      target.active = active;
    }

    if (accessLevel !== undefined) {
      target.accessLevel = accessLevel;
    }

    if (permissions !== undefined) {
      target.permissions = permissions;
    }

    return await this.accountRepository.update(address, target);
  }

  public getAccountExists(address: string) {
    return this.accountRepository.existsOR({ address }, 'address');
  }

  public getAccountExistsForEmail(email: string) {
    return this.accountDetailRepository.existsOR({ email }, 'email');
  }

  public getAccountDetail(apiQuery: APIQuery) {
    return this.accountDetailRepository.findOne(apiQuery);
  }

  public getAccounts(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.accountRepository.getAccounts(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public getAccount(address: string): Promise<Account> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !this.user.hasAnyPermission(Permission.manage_accounts) &&
      !(this.user.address === address)
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccount(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public async getAccount2(address: string): Promise<any> {
    if (
      !this.user.hasAnyPermission(Permission.manage_accounts) &&
      !(this.user.address === address)
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const data: any = {};
    data.account = await this.accountRepository.getAccount(
      new APIQuery({ address }),
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );

    if (!data.account) {
      throw new NotFoundError('Account not found');
    }

    data.details = await this.accountDetailRepository.findOne(new APIQuery({ address }));

    return data;
  }

  public async getPublicAccountDetails(address: string): Promise<any> {

    const account: any = await this.accountRepository.findOne(new APIQuery({ address }));

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const accountDetails: any = await this.accountDetailRepository.findOne(new APIQuery({ address }));

    if (!accountDetails) {
      throw new NotFoundError('Account details not found');
    }

    const organization: any = await this.organizationRepository.findOne(new APIQuery({ organizationId: account.organization }));

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const data: any = {};
    data.account = {
      address: account.address,
      fullName: accountDetails.fullName,
      email: accountDetails.email,
    };

    data.organization = {
      title: organization.title,
      timeZone: organization.timeZone,
      legalAddress: organization.legalAddress,
      organizationId: organization.organizationId,
      owner: organization.owner,
      active: organization.active,
    };

    return data;
  }

  public getAccountsByOrganization(
    organizationId: number
  ): Promise<MongoPagedResult> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(
        this.user.hasPermission(Permission.manage_accounts) &&
        this.user.organizationId === organizationId
      )
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ organization: organizationId });
    return this.accountRepository.getAccounts(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public async getOrganizationAddresses(
    organizationId: number
  ): Promise<string[]> {
    const apiQuery = new APIQuery({ organization: organizationId });
    apiQuery.fields = { address: 1 };
    const accounts = await this.accountRepository.find(apiQuery);
    const addresses = _.map(accounts, 'address');
    return addresses;
  }

  public async updateAccountDetail(
    address: string,
    accountDetail: AccountDetail
  ): Promise<Account> {
    const apiQuery = new APIQuery({ address });

    // First check if the current user can access this account
    const currentAccount = await this.getAccount(address);
    if (!currentAccount) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    // Update accountDetail collection
    accountDetail.setMutationTimestamp(this.user.address);
    await this.accountDetailRepository.update(apiQuery, accountDetail, true);

    // Finally return the account and accountDetail document joined
    return this.getAccount(address);
  }

  public getAccountForAuth(address: string): Promise<AccountDetail> {
    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccountForAuthorization(apiQuery);
  }

  public getAccountEncryptedToken(email: string): Promise<AccountDetail> {
    const apiQuery = new APIQuery({ email });
    apiQuery.fields = {
      _id: 0,
      token: 1,
    };
    return this.accountDetailRepository.findOne(apiQuery);
  }
}
