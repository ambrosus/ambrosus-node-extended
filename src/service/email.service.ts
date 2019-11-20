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

  public async sendInvitation(organizationInvite: OrganizationInvite, emailFrom: string, templateId: string) {
    const msg = {
      templateId,
      to: organizationInvite.email,
      from: emailFrom,
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

  public async sendOrganizationRequest(organizationRequest: OrganizationRequest) {
    const msg = {
      to: config.email.orgReqTo,
      from: config.email.defaultFrom,
      templateId: config.email.templateIdOrgReq,
      dynamic_template_data: {
        address: organizationRequest.address,
        organizationName: organizationRequest.title,
        message: organizationRequest.message,
        email: organizationRequest.email,
        dashboardLink: config.dashboardUrl,
      },
    };
    try {
      await sgMail.send(msg);
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
