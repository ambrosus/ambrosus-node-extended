import { inject, injectable } from 'inversify';

import { Permission, TYPE } from '../constant/';
import { AccountDetailRepository, AccountRepository } from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  Account,
  AccountDetail,
  APIQuery,
  MongoPagedResult,
  PermissionError,
  UserPrincipal,
  ExistsError,
} from '../model';
import { getTimestamp } from '../util';

@injectable()
export class AccountService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository,
    @inject(TYPE.AccountDetailRepository)
    private readonly accountDetailRepository: AccountDetailRepository,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) {}

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
      throw new ExistsError('An account already exists with this address');
    }
    if (await this.getAccountExistsForEmail(email)) {
      throw new ExistsError('An account already exists with this email');
    }
    const newAccount = new Account();
    newAccount.address = address;
    newAccount.accessLevel = accessLevel;
    newAccount.organization = organizationId;
    newAccount.permissions = permissions;
    newAccount.registeredBy = createdBy;
    newAccount.registeredOn = getTimestamp();

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
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
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
      throw new PermissionError();
    }

    const apiQuery = new APIQuery({ address });
    return this.accountRepository.getAccount(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public getAccountsByOrganization(organizationId: number): Promise<MongoPagedResult> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(
        this.user.hasPermission(Permission.manage_accounts) &&
        this.user.organizationId === organizationId
      )
    ) {
      throw new PermissionError();
    }
    const apiQuery = new APIQuery({ organization: organizationId });
    return this.accountRepository.getAccounts(
      apiQuery,
      this.user.organizationId,
      this.user.accessLevel,
      this.user.isSuperAdmin
    );
  }

  public async updateAccountDetail(
    address: string,
    accountDetail: AccountDetail
  ): Promise<Account> {
    const apiQuery = new APIQuery({ address });

    // First check if the current user can access this account
    const currentAccount = await this.getAccount(address);
    if (!currentAccount) {
      throw new PermissionError();
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
