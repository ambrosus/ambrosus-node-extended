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

//#region Imports
import { inject, injectable } from 'inversify';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';

import { Permission, TYPE } from '../constant/';
import {
  OrganizationInviteRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
  AccountRepository,
  AccountDetailRepository,
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
import { config } from '../config';

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
    @inject(TYPE.AccountRepository)
    private readonly accountRepository: AccountRepository,
    @inject(TYPE.AccountDetailRepository)
    private readonly accountDetailRepository: AccountDetailRepository,
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

    return this.organizationRepository.findWithPagination(apiQuery);
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
      !(Number(this.user.organizationId) === Number(organizationId) && this.user.isOrganizationOwner())
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError({ reason: 'An organization already exists with that title.' });
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
    return this.organizationRequestRepository.findWithPagination(apiQuery);
  }

  public getOrganizationRequestsRefused(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    apiQuery.addToQuery({ refused: true });
    return this.organizationRequestRepository.findWithPagination(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    const errors = {
      organizationRequest: [],
      account: [],
      organization: [],
    };

    // Check organization request

    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'email')) {
      errors.organizationRequest.push('email');
    }
    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'address')) {
      errors.organizationRequest.push('address');
    }
    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'title')) {
      errors.organizationRequest.push('title');
    }

    if (errors.organizationRequest.length) {
      throw new ExistsError({ reason: `An organization request already exists with this ${errors.organizationRequest.join(', ')}.` });
    }

    // Check account

    if (await this.accountRepository.existsOR(organizationRequest, 'address')) {
      errors.account.push('address');
    }
    if (await this.accountDetailRepository.existsOR(organizationRequest, 'email')) {
      errors.account.push('email');
    }

    if (errors.account.length) {
      throw new ExistsError({ reason: `An account already exists with this ${errors.account.join(', ')}.` });
    }

    // Check organization

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      errors.organization.push('title');
    }

    if (errors.organization.length) {
      throw new ExistsError({ reason: `An organization already exists with this ${errors.organization.join(', ')}.` });
    }

    // Send email
    await this.emailService.sendOrganizationRequest(organizationRequest);

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
    newOrganization.title = organizationRequest.title || `${organizationRequest.email}'s organization`;
    newOrganization.active = true;

    const result: InsertOneWriteOpResult<any> = await this.createOrganization(newOrganization);
    if (!result.ops[0]) {
      throw new CreateError({ reason: 'Organization' });
    }
    newOrganizationId = result.ops[0].organizationId;

    // Create account with new organizationId
    await this.accountService.createAccount(
      address,
      900,
      newOrganizationId,
      [Permission.create_asset, Permission.create_event, Permission.register_accounts, Permission.manage_accounts],
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
    if (!(this.user.organization && this.user.organization.organizationId)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }
    if (!apiQuery.query) {
      apiQuery.query = {};
    }
    apiQuery.query.organizationId = this.user.organization.organizationId;

    await this.organizationInviteRepository.deleteExpired();

    return this.organizationInviteRepository.findWithPagination(apiQuery);
  }

  public getInviteEmail(organization: Organization) {
    if (!organization.inviteEmail) {
      return config.email.defaultFrom;
    }
  }

  public getInviteTemplateId(organization: Organization) {

    if (!organization.inviteTemplateId) {
      return config.email.templateIdInvite;
    }
  }

  public async createOrganizationInvites(emails: string[]): Promise<any> {
    await this.organizationInviteRepository.deleteExpired();

    const inviteEmail = this.getInviteEmail(this.user.organization);
    const inviteTemplateId = this.getInviteTemplateId(this.user.organization);

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
        await this.emailService.sendInvitation(organizationInvite, inviteEmail, inviteTemplateId);
        success.push(organizationInvite.email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(`An invite for ${email} already exists.`);
      }
    }

    return { sent: success, errors: failed };
  }

  public async resendOrganizationInvites(emails: string[]): Promise<any> {
    const failed = [];
    const success = [];

    const inviteEmail = this.getInviteEmail(this.user.organization);
    const inviteTemplateId = this.getInviteTemplateId(this.user.organization);

    for (const email of emails) {
      try {
        const apiQuery = new APIQuery({ email });
        const organizationInvite = await this.organizationInviteRepository.findOne(apiQuery);
        if (!organizationInvite) {
          throw new NotFoundError({ reason: 'No invite found for email.' });
        }
        await this.emailService.sendInvitation(organizationInvite, inviteEmail, inviteTemplateId);
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
