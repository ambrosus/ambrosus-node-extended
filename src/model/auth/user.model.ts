import { injectable } from 'inversify';

import { Account, AuthToken } from '../';
import { timestampToDateString } from '../../util/helpers/datetime.helper';

export interface IUser {
  account: Account;
  authToken: AuthToken;

  isAuthorized(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

@injectable()
export class User implements IUser {
  public account: Account;
  public authToken: AuthToken;

  public hasRole(role: string): boolean {
    return false;
  }

  public hasPermission(permission: string): boolean {
    return this.account.permissions.indexOf(permission) > -1;
  }

  public isAuthorized(): boolean {
    return this.account && this.authToken && this.authToken.isValid();
  }

  public notAuthorizedReason(): string {
    if (!this.account) {
      return 'Account not found';
    }
    if (!this.authToken) {
      return 'Token not found';
    }
    if (!this.authToken.isValid()) {
      return `Token expired on: ${timestampToDateString(this.authToken.validUntil)}`;
    }
  }

  public isValid() {
    return this.account && this.authToken && this.authToken.isValid();
  }

  get address(): string {
    return this.account.address;
  }

  get accessLevel(): number {
    return this.account.accessLevel;
  }

  get organizationId(): number {
    return this.account.organization;
  }

  get isSuperAdmin(): boolean {
    return this.hasPermission('super_account');
  }
}
