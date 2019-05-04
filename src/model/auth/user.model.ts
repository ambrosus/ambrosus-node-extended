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

import { injectable } from 'inversify';

import { Account, AuthToken, Organization } from '../';
import { timestampToDateString } from '../../util';
import * as _ from 'lodash';
import { AccountDetail } from '../account';

export interface IUser {
  account: AccountDetail;
  authToken: AuthToken;
  organization: Organization;
  isAuthorized(): boolean;
  isOrganizationOwner(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

@injectable()
export class User implements IUser {
  public account: AccountDetail;
  public authToken: AuthToken;
  public organization: Organization;

  public hasRole(role: string): boolean {
    return false;
  }

  public hasPermission(permission: string): boolean {
    return this.account ? this.account.permissions.indexOf(permission) > -1 : false;
  }

  public hasPermissions(permissions: string[]): boolean {
    return permissions.every(permission =>
      this.account.permissions.some(accountPermission => accountPermission === permission)
    );
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
    return this.account ? this.account.address : undefined;
  }

  get accessLevel(): number {
    return this.account ? this.account.accessLevel : undefined;
  }

  get organizationId(): number {
    return this.account ? this.account.organization : undefined;
  }

  get isSuperAdmin(): boolean {
    return this.hasPermission('super_account');
  }

  get name(): string {
    return this.account ? this.account.fullName : undefined;
  }
}
