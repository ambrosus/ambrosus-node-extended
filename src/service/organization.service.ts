import { inject, injectable } from 'inversify';

import { config } from '../config';
import { Permission, TYPE } from '../constant/';
import {
  OrganizationInviteRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  APIQuery,
  ExistsError,
  MongoPagedResult,
  NotFoundError,
  Organization,
  OrganizationRequest,
  PermissionError,
  UserPrincipal,
} from '../model';
import { OrganizationInvite } from '../model/organization/organization-invite.model';
import { AccountService } from '../service/account.service';
import { sendEmail } from '../util';

@injectable()
export class OrganizationService {
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

  public getOrganizations(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.organizationRepository.find(apiQuery);
  }

  public async getOrganization(organizationId: number): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
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

  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganization(organization: Organization): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    if (!(await this.accountService.getAccountExists(organization.owner))) {
      throw new NotFoundError('Organization owner must have an account');
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    if (await this.organizationRepository.existsOR(organization, 'owner')) {
      throw new ExistsError('An organization already exists with that owner');
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
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.update(apiQuery, organization);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    if (
      await this.organizationRequestRepository.existsOR(
        organizationRequest,
        'email',
        'address',
        'title'
      )
    ) {
      throw new ExistsError('An organization request already exists');
    }

    if (await this.accountService.getAccountExists(organizationRequest.address)) {
      throw new ExistsError('An account already exists with this address');
    }

    if (await this.accountService.getAccountExistsForEmail(organizationRequest.email)) {
      throw new ExistsError('An account already exists with this email');
    }

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    organizationRequest.setCreationTimestamp();

    return this.organizationRequestRepository.create(organizationRequest);
  }

  public getOrganizationInvites(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.organizationInviteRepository.find(apiQuery);
  }

  public async createOrganizationInvites(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    const failed = [];
    const success = [];
    for (const email of emails) {
      const organizationInvite = OrganizationInvite.forEmail(email, this.user);
      if (await this.accountService.getAccountExistsForEmail(email)) {
        failed.push({ email, reason: 'Email used by an existing account' });
        this.logger.debug(`${email} is being used by another account`);
        continue;
      }
      if (await this.organizationInviteRepository.existsOR(organizationInvite, 'to')) {
        failed.push({ email, reason: 'An invite already exists with this email' });
        this.logger.debug(`An invite for ${email} already exists`);
        continue;
      }
      try {
        await this.organizationInviteRepository.create(organizationInvite);
        await this.sendOrganizationInviteEmail(organizationInvite.to);
        success.push(organizationInvite.to);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(`An invite for ${email} already exists`);
      }
    }

    return { sent: success, errors: failed };
  }

  public async resendOrganizationInviteEmails(emails: string[]): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
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
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    try {
      const apiQuery = new APIQuery({ to: email });
      const organizationInvite = await this.organizationInviteRepository.findOne(apiQuery);
      if (!organizationInvite) {
        throw new Error('No invite found for email');
      }
      sendEmail(
        config.email.from,
        organizationInvite.to,
        organizationInvite.subject,
        organizationInvite.html
      );
      organizationInvite.sent = true;
      await this.organizationInviteRepository.update(apiQuery, organizationInvite);
    } catch (error) {
      throw error;
    }
  }
}
