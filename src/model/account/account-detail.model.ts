/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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
import { injectable } from 'inversify';

import { getTimestamp } from '../../util';
import { Account } from './account.model';

export interface IAccountDetail {
  _id: string;
  address: string;
  active: boolean;
  fullName: string;
  email: string;
  password: string;
  token: number;
  extendedPermissions: string[];
  timeZone: string;
  lastSeen: number;
  createdBy: string;
  createdOn: number;
  modifiedBy: string;
  modifiedOn: number;
}

@injectable()
export class AccountDetail extends Account implements IAccountDetail {
  public static fromRequestForUpdate(req: Request) {
    const accountDetail = new AccountDetail();
    if (undefined !== req.body['fullName']) {
      accountDetail.fullName = req.body.fullName;
    }
    if (undefined !== req.body['email']) {
      accountDetail.email = req.body.email;
    }
    if (undefined !== req.body['token']) {
      accountDetail.token = req.body.token;
    }
    if (undefined !== req.body['timeZone']) {
      accountDetail.timeZone = req.body.timeZone;
    }
    return accountDetail;
  }

  public _id: string;
  public address: string;
  public active: boolean;
  public fullName: string;
  public email: string;
  public password: string;
  public token: number;
  public extendedPermissions: string[];
  public timeZone: string;
  public lastSeen: number;
  public createdBy: string;
  public createdOn: number;
  public modifiedBy: string;
  public modifiedOn: number;

  public setMutationTimestamp(address: string) {
    this.modifiedOn = getTimestamp();
    this.modifiedBy = address;
  }
}
