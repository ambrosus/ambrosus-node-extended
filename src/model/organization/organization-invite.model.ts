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

import { injectable } from 'inversify';
import * as uuidv4 from 'uuid/v4';

import { config } from '../../config';
import { getTimestamp, getTimestampAddDays } from '../../util';
import { UserPrincipal } from '../auth';

export interface IOrganizationInvite {
  _id: string;
  organizationId: number;
  email: string;
  subject: string;
  inviteId: string;
  invitationLink: string;
  sent: boolean;
  validUntil: number;
  createdBy: string;
  createdOn: number;
}

@injectable()
export class OrganizationInvite implements IOrganizationInvite {
  public static forEmail(email: string, user: UserPrincipal) {
    const organizationInvite = new OrganizationInvite();
    organizationInvite.organizationId = user.organizationId;
    organizationInvite.email = email;
    organizationInvite.sent = false;
    organizationInvite.validUntil = getTimestampAddDays(2);
    organizationInvite.createdBy = user.address;
    organizationInvite.createdOn = getTimestamp();
    organizationInvite.inviteId = uuidv4().replace(/-/g, '');
    organizationInvite.invitationLink = `${config.dashboardUrl}/signup?inviteId=${
      organizationInvite.inviteId
    }`;
    return organizationInvite;
  }

  public _id: string;
  public organizationId: number;
  public email: string;
  public subject: string;
  public inviteId: string;
  public invitationLink: string;
  public sent: boolean;
  public validUntil: number;
  public createdBy: string;
  public createdOn: number;
}
