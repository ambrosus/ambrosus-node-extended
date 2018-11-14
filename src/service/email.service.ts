import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { UserPrincipal, OrganizationInvite } from '../model';
import * as sgMail from '@sendgrid/mail';
import * as slug from 'slug';

@injectable()
export class EmailService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) {}

  public async sendInvitation(organizationInvite: OrganizationInvite) {
    console.log(this.user.organization);
    const msg = {
      to: organizationInvite.email,
      from: `no-reply@${slug(this.user.organization.title || 'dashboard')}.com`,
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

  private async handleSendError(error) {
      this.logger.captureError(error);
      const { message, code, response } = error;
      const { headers, body } = response;
      this.logger.error(response);
  }
}
