//#region Imports
import { inject, injectable } from 'inversify';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import * as sgMail from '@sendgrid/mail';
import { config } from '../config';
import {
  Permission,
  TEMPLATE_ORGANIZATION_APPROVAL,
  TEMPLATE_ORGANIZATION_DISAPPROVAL,
  TYPE,
} from '../constant/';
import {
  OrganizationInviteRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  APIQuery,
  ExistsError,
  InvalidError,
  MongoPagedResult,
  NotFoundError,
  Organization,
  OrganizationRequest,
  PermissionError,
  UserPrincipal,
} from '../model';
import { CreateError } from '../model/error/create.error';
import { OrganizationInvite } from '../model/organization/organization-invite.model';
import { AccountService } from '../service/account.service';
import { sendEmail } from '../util';

//#endregion

@injectable()
export class OrganizationService {
  //#region Constructor
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @inject(TYPE.OrganizationRequestRepository)
    private readonly organizationRequestRepository: OrganizationRequestRepository,
    @inject(TYPE.OrganizationInviteRepository)
    private readonly organizationInviteRepository: OrganizationInviteRepository,
    @inject(TYPE.AccountService) private readonly accountService: AccountService,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) {}
  //#endregion

  //#region Organization
  public getOrganizations(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    return this.organizationRepository.find(apiQuery);
  }

  public async getOrganization(organizationId: number): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError();
    }
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.findOne(apiQuery);
  }

  public getOrganizationForAuth(organizationId: number): Promise<Organization> {
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.getOrganizationForAuthorization(apiQuery);
  }

  public getOrganizationAccounts(organizationId: number): Promise<MongoPagedResult> {
    return this.accountService.getAccountsByOrganization(organizationId);
  }

  public async createOrganization(organization: Organization): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }

    if (await this.accountService.getAccountExists(organization.owner)) {
      throw new NotFoundError('Organization owner already has an account');
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError('An organization already exists with that title.');
    }

    if (await this.organizationRepository.existsOR(organization, 'owner')) {
      throw new ExistsError('An organization already exists with that owner.');
    }

    organization.setCreationTimestamp(this.user.address);
    organization.organizationId = await this.organizationRepository.getNewOrganizationIdentifier();

    return this.organizationRepository.create(organization);
  }

  public async updateOrganization(
    organizationId: number,
    organization: Organization
  ): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(this.user.organizationId === organizationId && this.user.isOrganizationOwner())
    ) {
      throw new PermissionError();
    }
    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.update(apiQuery, organization);
  }
  //#endregion

  //#region Organization Request
  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }

    if (
      await this.organizationRequestRepository.existsOR(
        organizationRequest,
        'email',
        'address',
        'title'
      )
    ) {
      throw new ExistsError('An organization request already exists.');
    }

    if (await this.accountService.getAccountExists(organizationRequest.address)) {
      throw new ExistsError('An account already exists with this address.');
    }

    if (await this.accountService.getAccountExistsForEmail(organizationRequest.email)) {
      throw new ExistsError('An account already exists with this email.');
    }

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      throw new ExistsError('An organization already exists with that title.');
    }

    organizationRequest.setCreationTimestamp();

    return this.organizationRequestRepository.create(organizationRequest);
  }

  public async deleteOrganizationRequest(address: string): Promise<DeleteWriteOpResultObject> {
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.deleteOne(apiQuery);
  }

  public async organizationRequestApprove(address: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    let newOrganizationId;
    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError('Organization request not found.');
    }

    // Create organization
    const newOrganization = new Organization();
    newOrganization.owner = organizationRequest.address;
    newOrganization.title = organizationRequest.title;
    newOrganization.active = true;

    const result: InsertOneWriteOpResult = await this.createOrganization(newOrganization);
    if (!result.ops[0]) {
      throw new CreateError('Organization');
    }
    newOrganizationId = result.ops[0].organizationId;

    // Create account with new organizationId
    await this.accountService.createAccount(
      address,
      1,
      newOrganizationId,
      [Permission.create_asset, Permission.create_event],
      organizationRequest.email,
      undefined,
      this.user.address
    );

    // Remove organization request
    await this.deleteOrganizationRequest(address);

    const url = `${config.dashboardUrl}/login`;

    // Send email
    sendEmail(
      config.email.from,
      organizationRequest.email,
      `Your organization request has been approved`,
      TEMPLATE_ORGANIZATION_APPROVAL.replace(/@url/g, url)
    );
  }

  public async organizationRequestRefuse(address: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }

    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError('Organization request not found.');
    }

    // Remove organization request
    await this.deleteOrganizationRequest(address);

    // Send email
    sendEmail(
      config.email.from,
      organizationRequest.email,
      'Your organization request was not been approved',
      TEMPLATE_ORGANIZATION_DISAPPROVAL
    );
  }
  //#endregion

  //#region Organization Invite
  public async getOrganizationInvites(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    await this.organizationInviteRepository.deleteExpired();

    return this.organizationInviteRepository.find(apiQuery);
  }

  public async createOrganizationInvites(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    await this.organizationInviteRepository.deleteExpired();

    const failed = [];
    const success = [];
    for (const email of emails) {
      const organizationInvite = OrganizationInvite.forEmail(email, this.user);
      if (await this.accountService.getAccountExistsForEmail(email)) {
        failed.push({ email, reason: 'Email used by an existing account.' });
        this.logger.debug(`${email} is being used by another account`);
        continue;
      }
      if (await this.organizationInviteRepository.existsOR(organizationInvite, 'to')) {
        failed.push({ email, reason: 'An invite already exists with this email.' });
        this.logger.debug(`An invite for ${email} already exists.`);
        continue;
      }
      try {
        await this.organizationInviteRepository.create(organizationInvite);
        await this.sendOrganizationInviteEmail(organizationInvite.to);
        success.push(organizationInvite.to);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(`An invite for ${email} already exists.`);
      }
    }

    return { sent: success, errors: failed };
  }

  public async resendOrganizationInviteEmails(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    const failed = [];
    const success = [];
    for (const email of emails) {
      try {
        await this.sendOrganizationInviteEmail(email);
        success.push(email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(error);
      }
    }
    return { sent: success, errors: failed };
  }

  public async sendOrganizationInviteEmail(email: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError();
    }
    try {
      const apiQuery = new APIQuery({ to: email });
      const organizationInvite = await this.organizationInviteRepository.findOne(apiQuery);
      if (!organizationInvite) {
        throw new Error('No invite found for email.');
      }
      sendEmail(
        config.email.from,
        organizationInvite.to,
        organizationInvite.subject,
        organizationInvite.html
      );
      // const msg = {
      //   to: organizationInvite.to,
      //   from: config.email.from,
      //   subject: organizationInvite.subject,
      //   templateId: 'd-0f9b5646779e4e41a62e682f659c3350',
      //   dynamic_template_data: {
      //     subject: organizationInvite.subject,
      //     test_1: 'quick brown fox',
      //     test_2: ' the lazy dog',
      //   },
      // };
      // sgMail.send(msg);

      organizationInvite.sent = true;
      await this.organizationInviteRepository.update(apiQuery, organizationInvite);
    } catch (error) {
      throw error;
    }
  }

  public async organizationInviteExists(inviteId: string): Promise<boolean> {
    await this.organizationInviteRepository.deleteExpired();

    const apiQuery = new APIQuery({ inviteId });
    const invite = await this.organizationInviteRepository.findOne(apiQuery);
    if (!invite) {
      throw new InvalidError('Invite not found.');
    }
    return true;
  }

  public async deleteOrganizationInvite(inviteId: string): Promise<DeleteWriteOpResultObject> {
    const apiQuery = new APIQuery({ inviteId });
    return this.organizationInviteRepository.deleteOne(apiQuery);
  }

  public async acceptOrganizationInvite(inviteId: string, address: string) {
    await this.organizationInviteRepository.deleteExpired();
    const apiQuery = new APIQuery({ inviteId });
    const invite = await this.organizationInviteRepository.findOne(apiQuery);
    if (!invite) {
      throw new InvalidError('Invite not found.');
    }
    await this.accountService.createAccount(
      address,
      1,
      invite.organizationId,
      [Permission.create_asset, Permission.create_event],
      invite.to,
      undefined,
      invite.createdBy
    );

    await this.organizationInviteRepository.deleteOne(apiQuery);

    return address;
  }
  //#endregion
}
