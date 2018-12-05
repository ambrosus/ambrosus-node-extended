//#region Imports
import { inject, injectable } from 'inversify';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';

import { Permission, TYPE } from '../constant/';
import {
  OrganizationInviteRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  APIQuery,
  MongoPagedResult,
  Organization,
  OrganizationRequest,
  UserPrincipal,
} from '../model';
import { OrganizationInvite } from '../model/organization/organization-invite.model';
import { AccountService } from '../service/account.service';
import { EmailService } from '../service/email.service';

import { ExistsError, ValidationError, NotFoundError, PermissionError, CreateError } from '../errors';

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
    @inject(TYPE.EmailService) private readonly emailService: EmailService,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) { }
  //#endregion

  //#region Organization
  public getOrganizations(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    return this.organizationRepository.find(apiQuery);
  }

  public async getOrganization(organizationId: number): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
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
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    if (await this.accountService.getAccountExists(organization.owner)) {
      throw new NotFoundError({ reason: 'Organization owner already has an account' });
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError({ reason: 'An organization already exists with that title.' });
    }

    if (await this.organizationRepository.existsOR(organization, 'owner')) {
      throw new ExistsError({ reason: 'An organization already exists with that owner.' });
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
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.update(apiQuery, organization);
  }
  //#endregion

  //#region Organization Request
  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    apiQuery.addToQuery({ refused: { $ne: true } });
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequestsRefused(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    apiQuery.addToQuery({ refused: true });
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    if (
      await this.organizationRequestRepository.existsOR(
        organizationRequest,
        'email',
        'address',
        'title'
      )
    ) {
      throw new ExistsError({ reason: 'An organization request already exists.' });
    }

    if (await this.accountService.getAccountExists(organizationRequest.address)) {
      throw new ExistsError({ reason: 'An account already exists with this address.' });
    }

    if (await this.accountService.getAccountExistsForEmail(organizationRequest.email)) {
      throw new ExistsError({ reason: 'An account already exists with this email.' });
    }

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      throw new ExistsError({ reason: 'An organization already exists with that title.' });
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
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    let newOrganizationId;
    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError({ reason: 'Organization request not found.' });
    }

    // Create organization
    const newOrganization = new Organization();
    newOrganization.owner = organizationRequest.address;
    newOrganization.title = organizationRequest.title;
    newOrganization.active = true;

    const result: InsertOneWriteOpResult = await this.createOrganization(newOrganization);
    if (!result.ops[0]) {
      throw new CreateError({ reason: 'Organization' });
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

    // Send email
    await this.emailService.sendOrganizationRequestApproval(organizationRequest);

    // Remove organization request
    await this.deleteOrganizationRequest(address);
  }

  public async organizationRequestRefuse(address: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError({ reason: 'Organization request not found.' });
    }

    // Send email
    await this.emailService.sendOrganizationRequestRefuse(organizationRequest);

    // Mark organization request refused
    organizationRequest.refused = true;
    const apiQuery = new APIQuery({ address });
    await this.organizationRequestRepository.update(apiQuery, organizationRequest);
  }
  //#endregion

  //#region Organization Invite
  public async getOrganizationInvites(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }
    await this.organizationInviteRepository.deleteExpired();

    return this.organizationInviteRepository.find(apiQuery);
  }

  public async createOrganizationInvites(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
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
      if (await this.organizationInviteRepository.existsOR(organizationInvite, 'email')) {
        failed.push({ email, reason: 'An invite already exists with this email.' });
        this.logger.debug(`An invite for ${email} already exists.`);
        continue;
      }
      try {
        await this.organizationInviteRepository.create(organizationInvite);
        await this.emailService.sendInvitation(organizationInvite);
        success.push(organizationInvite.email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(`An invite for ${email} already exists.`);
      }
    }

    return { sent: success, errors: failed };
  }

  public async resendOrganizationInvites(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }
    const failed = [];
    const success = [];
    for (const email of emails) {
      try {
        const apiQuery = new APIQuery({ email });
        const organizationInvite = await this.organizationInviteRepository.findOne(apiQuery);
        if (!organizationInvite) {
          throw new NotFoundError({ reason: 'No invite found for email.' });
        }
        await this.emailService.sendInvitation(organizationInvite);
        await this.organizationInviteRepository.update(apiQuery, organizationInvite);
        success.push(email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(error);
      }
    }
    return { sent: success, errors: failed };
  }

  public async organizationInviteExists(inviteId: string): Promise<boolean> {
    await this.organizationInviteRepository.deleteExpired();

    const apiQuery = new APIQuery({ inviteId });
    const invite = await this.organizationInviteRepository.findOne(apiQuery);
    if (!invite) {
      throw new NotFoundError({ reason: 'Invite not found.' });
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
      throw new ValidationError({ reason: 'Invite not found.' });
    }
    await this.accountService.createAccount(
      address,
      1,
      invite.organizationId,
      [Permission.create_asset, Permission.create_event],
      invite.email,
      undefined,
      invite.createdBy
    );

    await this.organizationInviteRepository.deleteOne(apiQuery);

    return address;
  }
  //#endregion
}
