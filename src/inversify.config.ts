import { RequestHandler } from 'express';
import { Container, interfaces } from 'inversify';

import { MIDDLEWARE, TYPE } from './constant/types';
import { AccountController } from './controller/account.controller';
import { AnalyticsController } from './controller/analytics.controller';
import { AssetController } from './controller/asset.controller';
import { BundleController } from './controller/bundle.controller';
import { EventController } from './controller/event.controller';
import { GraphQLController } from './controller/graphql.controller';
import { OrganizationController } from './controller/organization.controller';
import { OrganizationRequestController } from './controller/organization-request.controller';
import { OrganizationInviteController } from './controller/organization-invite.controller';
import { RootController } from './controller/root.controller';
import { MetricController } from './controller/metric.controller';
import { HealthController } from './controller/health.controller';
import { DBClient } from './database/client';
import {
  AccountRepository,
  AccountDetailRepository,
  AssetRepository,
  BundleRepository,
  EventRepository,
  OrganizationRepository,
  OrganizationRequestRepository,
  OrganizationInviteRepository,
} from './database/repository';
import { GraphQLSchema, IGraphQLResolver, IGraphQLSchema, IGraphQLType } from './graphql';
import { AccountResolver, AssetResolver, BundleResolver, EventResolver } from './graphql/resolver';
import { AccountType, AssetType, BundleType, EventType, QueryType } from './graphql/type';
import { AuthorizedMiddleware, NodeAdminMiddleware } from './middleware';
import { UserPrincipal } from './model';
import { AccountService } from './service/account.service';
import { AnalyticsService } from './service/analytics.service';
import { AssetService } from './service/asset.service';
import { AuthService } from './service/auth.service';
import { BundleService } from './service/bundle.service';
import { EventService } from './service/event.service';
import { LoggerService } from './service/logger.service';
import { EmailService } from './service/email.service';

import { OrganizationService } from './service/organization.service';
import { Web3Service } from './service/web3.service';
import { ContextMiddleware } from './middleware/context.middleware';

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
  .bind<EventRepository>(TYPE.EventRepository)
  .to(EventRepository)
  .inSingletonScope();
iocContainer
  .bind<BundleRepository>(TYPE.BundleRepository)
  .to(BundleRepository)
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

// controllers
iocContainer.bind<RootController>(TYPE.RootController).to(RootController);
iocContainer.bind<GraphQLController>(TYPE.GraphQLController).to(GraphQLController);
iocContainer.bind<AccountController>(TYPE.AccountController).to(AccountController);
iocContainer.bind<AssetController>(TYPE.AssetController).to(AssetController);
iocContainer.bind<EventController>(TYPE.EventController).to(EventController);
iocContainer.bind<BundleController>(TYPE.BundleController).to(BundleController);
iocContainer.bind<AnalyticsController>(TYPE.AnalyticsController).to(AnalyticsController);
iocContainer.bind<OrganizationController>(TYPE.OrganizationController).to(OrganizationController);
iocContainer
  .bind<OrganizationRequestController>(TYPE.OrganizationRequestController)
  .to(OrganizationRequestController);
iocContainer
  .bind<OrganizationInviteController>(TYPE.OrganizationInviteController)
  .to(OrganizationInviteController);
iocContainer.bind<MetricController>(TYPE.MetricController).to(MetricController);
iocContainer.bind<HealthController>(TYPE.HealthController).to(HealthController);

// services
iocContainer.bind<AuthService>(TYPE.AuthService).to(AuthService);
iocContainer.bind<Web3Service>(TYPE.Web3Service).to(Web3Service);
iocContainer.bind<LoggerService>(TYPE.LoggerService).to(LoggerService);
iocContainer.bind<AccountService>(TYPE.AccountService).to(AccountService);
iocContainer.bind<AssetService>(TYPE.AssetService).to(AssetService);
iocContainer.bind<EventService>(TYPE.EventService).to(EventService);
iocContainer.bind<BundleService>(TYPE.BundleService).to(BundleService);
iocContainer.bind<AnalyticsService>(TYPE.AnalyticsService).to(AnalyticsService);
iocContainer.bind<OrganizationService>(TYPE.OrganizationService).to(OrganizationService);
iocContainer.bind<EmailService>(TYPE.EmailService).to(EmailService);

// middleware
iocContainer.bind<AuthorizedMiddleware>(MIDDLEWARE.Authorized).to(AuthorizedMiddleware);
iocContainer.bind<NodeAdminMiddleware>(MIDDLEWARE.NodeAdmin).to(NodeAdminMiddleware);
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
