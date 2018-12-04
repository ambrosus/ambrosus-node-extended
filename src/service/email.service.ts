import * as sgMail from '@sendgrid/mail';
import { inject, injectable } from 'inversify';

import { config } from '../config';
import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { OrganizationInvite, OrganizationRequest, UserPrincipal } from '../model';

@injectable()
export class EmailService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) { }

  public async sendInvitation(organizationInvite: OrganizationInvite) {
    const msg = {
      to: organizationInvite.email,
      from: config.email.defaultFrom,
      templateId: config.email.templateIdInvite,
      dynamic_template_data: {
        organizationName: this.user.organization.title || 'an organization',
        invitationLink: organizationInvite.invitationLink,
      },
    };
    try {
      await sgMail.send(msg);
      organizationInvite.sent = true;
    } catch (error) {
      this.handleSendError(error);
    }
  }

  public async sendOrganizationRequestApproval(organizationRequest: OrganizationRequest) {
    const msg = {
      to: organizationRequest.email,
      from: config.email.defaultFrom,
      templateId: config.email.templateIdOrgReqApprove,
      dynamic_template_data: {
        dashboardLink: config.dashboardUrl,
      },
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      this.handleSendError(error);
    }
  }

  public async sendOrganizationRequestRefuse(organizationRequest: OrganizationRequest) {
    const msg = {
      to: organizationRequest.email,
      from: config.email.defaultFrom,
      templateId: config.email.templateIdOrgReqRefuse,
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      this.handleSendError(error);
    }
  }

  private async handleSendError(error) {
    this.logger.captureError(error);
    const { message, code, response } = error;
    const { headers, body } = response;
    this.logger.error(body);
  }
}
