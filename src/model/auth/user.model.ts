import { injectable } from 'inversify';

import { Account, AuthToken, Organization } from '../';
import { timestampToDateString } from '../../util/helpers/datetime.helper';
import * as _ from 'lodash';

export interface IUser {
  account: Account;
  authToken: AuthToken;
  organization: Organization;
  isAuthorized(): boolean;
  isOrganizationOwner(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

@injectable()
export class User implements IUser {
  public account: Account;
  public authToken: AuthToken;
  public organization: Organization;

  public hasRole(role: string): boolean {
    return false;
  }

  public hasPermission(permission: string): boolean {
    return this.account.permissions.indexOf(permission) > -1;
  }

  public hasAnyPermission(...permission): boolean {
    return _.intersection(this.account.permissions, permission).length > 0;
  }

  public isAuthorized(): boolean {
    return this.account && this.authToken && this.authToken.isValid();
  }

  public isOrganizationOwner(): boolean {
    return this.account.address === this.organization.owner;
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
