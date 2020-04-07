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

import { Container, interfaces } from 'inversify';

import { MIDDLEWARE, TYPE } from './constant/types';
import { AccountController } from './controller/account.controller';
import { Account2Controller } from './controller/account2.controller';
import { AnalyticsController } from './controller/analytics.controller';
import { AssetController } from './controller/asset.controller';
import { Asset2Controller } from './controller/asset2.controller';
import { AssetsController } from './controller/assets.controller';
import { BundleController } from './controller/bundle.controller';
import { Bundle2Controller } from './controller/bundle2.controller';
import { EventController } from './controller/event.controller';
import { Event2Controller } from './controller/event2.controller';
import { ExtendedController } from './controller/extended.controller';
import { GraphQLController } from './controller/graphql.controller';
import { OrganizationController } from './controller/organization.controller';
import { Organization2Controller } from './controller/organization2.controller';
import { OrganizationRequestController } from './controller/organization-request.controller';
import { OrganizationInviteController } from './controller/organization-invite.controller';
import { RootController } from './controller/root.controller';
import { MetricController } from './controller/metric.controller';
import { HealthController } from './controller/health.controller';
import { NodeinfoController } from './controller/nodeinfo.controller';
import { DBClient } from './database/client';
import {
  AccountRepository,
  AccountDetailRepository,
  AssetRepository,
  BundleRepository,
  GridRepository,
  EventRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
  OrganizationInviteRepository,
  WorkerLogsRepository,
  ThrottlingRepository,
} from './database/repository';
import { GraphQLSchema, IGraphQLResolver, IGraphQLSchema, IGraphQLType } from './graphql';
import { AccountResolver, AssetResolver, BundleResolver, EventResolver } from './graphql/resolver';
import { AccountType, AssetType, BundleType, EventType, QueryType } from './graphql/type';
import { UserPrincipal } from './model';
import { AccountService } from './service/account.service';
import { ThrottlingService } from './service/throttling.service';
import { AnalyticsService } from './service/analytics.service';
import { AssetService } from './service/asset.service';
import { AuthService } from './service/auth.service';
import { BundleService } from './service/bundle.service';
import { EventService } from './service/event.service';
import { LoggerService } from './service/logger.service';
import { EmailService } from './service/email.service';
import { StateService } from './service/state.service';
import { BuiltInService } from './service/builtin.service';

import { OrganizationService } from './service/organization.service';
import { Web3Service } from './service/web3.service';
import { ContextMiddleware } from './middleware/context.middleware';
import { MobileService } from './service/mobile.service';
import { MobileController } from './controller/mobile.controller';
export const iocContainer: Container = new Container();

// db
iocContainer
  .bind<DBClient>(TYPE.DBClient)
  .to(DBClient)
  .inSingletonScope();

// repositories
iocContainer
  .bind<AccountRepository>(TYPE.AccountRepository)
  .to(AccountRepository)
  .inSingletonScope();
iocContainer
  .bind<AccountDetailRepository>(TYPE.AccountDetailRepository)
  .to(AccountDetailRepository)
  .inSingletonScope();
iocContainer
  .bind<AssetRepository>(TYPE.AssetRepository)
  .to(AssetRepository)
  .inSingletonScope();
iocContainer
  .bind<ThrottlingRepository>(TYPE.ThrottlingRepository)
  .to(ThrottlingRepository)
  .inSingletonScope();
iocContainer
  .bind<EventRepository>(TYPE.EventRepository)
  .to(EventRepository)
  .inSingletonScope();
iocContainer
  .bind<BundleRepository>(TYPE.BundleRepository)
  .to(BundleRepository)
  .inSingletonScope();
iocContainer
  .bind<GridRepository>(TYPE.GridRepository)
  .to(GridRepository)
  .inSingletonScope();
iocContainer
  .bind<OrganizationRepository>(TYPE.OrganizationRepository)
  .to(OrganizationRepository)
  .inSingletonScope();
iocContainer
  .bind<OrganizationRequestRepository>(TYPE.OrganizationRequestRepository)
  .to(OrganizationRequestRepository)
  .inSingletonScope();
iocContainer
  .bind<OrganizationInviteRepository>(TYPE.OrganizationInviteRepository)
  .to(OrganizationInviteRepository)
  .inSingletonScope();
iocContainer
  .bind<WorkerLogsRepository>(TYPE.WorkerLogsRepository)
  .to(WorkerLogsRepository)
  .inSingletonScope();

// controllers
iocContainer.bind<RootController>(TYPE.RootController).to(RootController);
iocContainer.bind<GraphQLController>(TYPE.GraphQLController).to(GraphQLController);
iocContainer.bind<AccountController>(TYPE.AccountController).to(AccountController);
iocContainer.bind<Account2Controller>(TYPE.Account2Controller).to(Account2Controller);
iocContainer.bind<AssetController>(TYPE.AssetController).to(AssetController);
iocContainer.bind<Asset2Controller>(TYPE.Asset2Controller).to(Asset2Controller);
iocContainer.bind<AssetsController>(TYPE.AssetsController).to(AssetsController);
iocContainer.bind<EventController>(TYPE.EventController).to(EventController);
iocContainer.bind<Event2Controller>(TYPE.Event2Controller).to(Event2Controller);
iocContainer.bind<ExtendedController>(TYPE.ExtendedController).to(ExtendedController);
iocContainer.bind<BundleController>(TYPE.BundleController).to(BundleController);
iocContainer.bind<Bundle2Controller>(TYPE.Bundle2Controller).to(Bundle2Controller);
iocContainer.bind<AnalyticsController>(TYPE.AnalyticsController).to(AnalyticsController);
iocContainer.bind<OrganizationController>(TYPE.OrganizationController).to(OrganizationController);
iocContainer.bind<Organization2Controller>(TYPE.Organization2Controller).to(Organization2Controller);
iocContainer
  .bind<OrganizationRequestController>(TYPE.OrganizationRequestController)
  .to(OrganizationRequestController);
iocContainer
  .bind<OrganizationInviteController>(TYPE.OrganizationInviteController)
  .to(OrganizationInviteController);
iocContainer.bind<MetricController>(TYPE.MetricController).to(MetricController);
iocContainer.bind<HealthController>(TYPE.HealthController).to(HealthController);
iocContainer.bind<NodeinfoController>(TYPE.NodeinfoController).to(NodeinfoController);
iocContainer.bind<MobileController>(TYPE.MobileController).to(MobileController);

// services
iocContainer.bind<AuthService>(TYPE.AuthService).to(AuthService);
iocContainer.bind<Web3Service>(TYPE.Web3Service).to(Web3Service);
iocContainer.bind<LoggerService>(TYPE.LoggerService).to(LoggerService);
iocContainer.bind<AccountService>(TYPE.AccountService).to(AccountService);
iocContainer.bind<ThrottlingService>(TYPE.ThrottlingService).to(ThrottlingService);
iocContainer.bind<StateService>(TYPE.StateService).to(StateService);
iocContainer.bind<BuiltInService>(TYPE.BuiltInService).to(BuiltInService);

iocContainer.bind<AssetService>(TYPE.AssetService).to(AssetService);
iocContainer.bind<EventService>(TYPE.EventService).to(EventService);
iocContainer.bind<BundleService>(TYPE.BundleService).to(BundleService);
iocContainer.bind<AnalyticsService>(TYPE.AnalyticsService).to(AnalyticsService);
iocContainer.bind<OrganizationService>(TYPE.OrganizationService).to(OrganizationService);
iocContainer.bind<EmailService>(TYPE.EmailService).to(EmailService);
iocContainer.bind<MobileService>(TYPE.MobileService).to(MobileService);

// middleware

iocContainer.bind<ContextMiddleware>(MIDDLEWARE.Context).to(ContextMiddleware);

// gql schema
iocContainer.bind<IGraphQLSchema>(TYPE.GraphQLSchema).to(GraphQLSchema);

// gql types
iocContainer.bind<IGraphQLType>(TYPE.GraphQLType).to(AccountType);
iocContainer.bind<IGraphQLType>(TYPE.GraphQLType).to(AssetType);
iocContainer.bind<IGraphQLType>(TYPE.GraphQLType).to(EventType);
iocContainer.bind<IGraphQLType>(TYPE.GraphQLType).to(BundleType);
iocContainer.bind<IGraphQLType>(TYPE.GraphQLType).to(QueryType);

// gql resolvers
iocContainer.bind<IGraphQLResolver>(TYPE.GraphQLResolver).to(AccountResolver);
iocContainer.bind<IGraphQLResolver>(TYPE.GraphQLResolver).to(AssetResolver);
iocContainer.bind<IGraphQLResolver>(TYPE.GraphQLResolver).to(EventResolver);
iocContainer.bind<IGraphQLResolver>(TYPE.GraphQLResolver).to(BundleResolver);

iocContainer
  .bind<UserPrincipal>(TYPE.UserPrincipal)
  .toDynamicValue((context: interfaces.Context) => {
    return new UserPrincipal();
  });
