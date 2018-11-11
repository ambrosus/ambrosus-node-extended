import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';
import web3 = require('web3');
import { getTimestamp, getTimestampAddDays, encrypt } from '../../util';
import { UserPrincipal } from '../auth';
import { TEMPLATE_INVITE } from '../../constant';
import { config } from '../../config';
import * as slug from 'slug';

export interface IOrganizationInvite {
  _id: string;
  organizationId: number;
  from: string;
  to: string;
  subject: string;
  html: string;
  token: string;
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
    organizationInvite.to = email;
    organizationInvite.subject = `${user.name} invited you to join ${user.organization.title ||
      'our'} dashboard`;
    organizationInvite.from = `no-reply@${slug(user.organization.title || 'dashboard')}.com`;
    organizationInvite.sent = false;
    organizationInvite.validUntil = getTimestampAddDays(2);
    organizationInvite.createdBy = user.address;
    organizationInvite.createdOn = getTimestamp();
    organizationInvite.token = encrypt(
      JSON.stringify({ email, createdAt: getTimestamp(), organization: user.organizationId })
    );

    const url = `https://${config.dashboardUrl}/signup?token=${organizationInvite.token}`;
    organizationInvite.html = TEMPLATE_INVITE.replace(/@url/g, url);
    return organizationInvite;
  }

  public _id: string;
  public organizationId: number;
  public from: string;
  public to: string;
  public subject: string;
  public html: string;
  public token: string;
  public sent: boolean;
  public validUntil: number;
  public createdBy: string;
  public createdOn: number;
}
