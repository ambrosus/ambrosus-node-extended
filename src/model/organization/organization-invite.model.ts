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
