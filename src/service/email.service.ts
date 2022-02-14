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
// tslint:disable-next-line
import sgMail from '@sendgrid/mail';
import { inject, injectable } from 'inversify';

import { config } from '../config';
import { TYPE } from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { OrganizationInvite, OrganizationRequest, UserPrincipal } from '../model';
import { StateService } from './state.service';

@injectable()
export class EmailService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.StateService) private readonly state: StateService,
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

  public paramsCheck() {
    try {
      const {mailInfo} = this.state.readFileSync();
      config.email.api = mailInfo.apiKey;
      config.email.defaultFrom = mailInfo.from;
      config.email.orgReqTo = mailInfo.orgRegTo;
      config.email.templateIdInvite = mailInfo.templateIds.invite;
      config.email.templateIdOrgReq = mailInfo.templateIds.orgReq;
      config.email.templateIdOrgReqApprove = mailInfo.templateIds.orgReqApprove;
      config.email.templateIdOrgReqRefuse = mailInfo.templateIds.orgReqRefuse;
      sgMail.setApiKey(config.email.api);
    } catch (err) {
      this.logger.error(`unable to get mailInfo from state.json: ${err}`);
    }
    this.checkVariable('config.dashboardUrl', config.dashboardUrl);
    this.checkVariable('config.email.api', config.email.api);
    this.checkVariable('config.email.defaultFrom', config.email.defaultFrom);
    this.checkVariable('config.email.orgReqTo', config.email.orgReqTo);
    this.checkVariable('config.email.templateIdInvite', config.email.templateIdInvite);
    this.checkVariable('config.email.templateIdOrgReq', config.email.templateIdOrgReq);
    this.checkVariable('config.email.templateIdOrgReqApprove', config.email.templateIdOrgReqApprove);
    this.checkVariable('config.email.templateIdOrgReqRefuse', config.email.templateIdOrgReqRefuse);
  }

  private checkVariable(name: string, variable) {
    if (variable === undefined) {
      this.logger.error('checkVariable: undefined', name);
    }
  }

  private async handleSendError(error) {
    this.logger.captureError(error);
    const { message, code, response } = error;
    const { headers, body } = response;
    this.logger.error(body);
  }
}
