import { Container, interfaces } from 'inversify';

import { TYPES } from './constant/types';
import { AccountController } from './controller/account.controller';
import { AnalyticsController } from './controller/analytics.controller';
import { AssetController } from './controller/asset.controller';
import { BundleController } from './controller/bundle.controller';
import { EventController } from './controller/event.controller';
import { GraphQLController } from './controller/graphql.controller';
import { RootController } from './controller/root.controller';
import { DBClient } from './database/client';
import {
  AccountRepository,
  AssetRepository,
  BundleRepository,
  EventRepository,
} from './database/repository';
import { GraphQLSchema, IGraphQLResolver, IGraphQLSchema, IGraphQLType } from './graphql';
import { AccountResolver, AssetResolver, BundleResolver, EventResolver } from './graphql/resolver';
import { AccountType, AssetType, BundleType, EventType, QueryType } from './graphql/type';
import { AuthorizedMiddleware } from './middleware';
import { UserPrincipal } from './model';
import { AccountService } from './service/account.service';
import { AnalyticsService } from './service/analytics.service';
import { AssetService } from './service/asset.service';
import { AuthService } from './service/auth.service';
import { BundleService } from './service/bundle.service';
import { EventService } from './service/event.service';
import { LoggerService } from './service/logger.service';
import { Web3Service } from './service/web3.service';

export const iocContainer: Container = new Container();

// db
iocContainer
  .bind<DBClient>(TYPES.DBClient)
  .to(DBClient)
  .inSingletonScope();

// controllers
iocContainer.bind<RootController>(TYPES.RootController).to(RootController);
iocContainer.bind<GraphQLController>(TYPES.GraphQLController).to(GraphQLController);
iocContainer.bind<AccountController>(TYPES.AccountController).to(AccountController);
iocContainer.bind<AssetController>(TYPES.AssetController).to(AssetController);
iocContainer.bind<EventController>(TYPES.EventController).to(EventController);
iocContainer.bind<BundleController>(TYPES.BundleController).to(BundleController);
iocContainer.bind<AnalyticsController>(TYPES.AnalyticsController).to(AnalyticsController);

// services
iocContainer.bind<AuthService>(TYPES.AuthService).to(AuthService);
iocContainer.bind<Web3Service>(TYPES.Web3Service).to(Web3Service);
iocContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerService);
iocContainer.bind<AccountService>(TYPES.AccountService).to(AccountService);
iocContainer.bind<AssetService>(TYPES.AssetService).to(AssetService);
iocContainer.bind<EventService>(TYPES.EventService).to(EventService);
iocContainer.bind<BundleService>(TYPES.BundleService).to(BundleService);
iocContainer.bind<AnalyticsService>(TYPES.AnalyticsService).to(AnalyticsService);

// repositories
iocContainer.bind<AccountRepository>(TYPES.AccountRepository).to(AccountRepository);
iocContainer.bind<AssetRepository>(TYPES.AssetRepository).to(AssetRepository);
iocContainer.bind<EventRepository>(TYPES.EventRepository).to(EventRepository);
iocContainer.bind<BundleRepository>(TYPES.BundleRepository).to(BundleRepository);

// middleware
iocContainer.bind<AuthorizedMiddleware>(TYPES.AuthorizedMiddleware).to(AuthorizedMiddleware);

// gql schema
iocContainer.bind<IGraphQLSchema>(TYPES.GraphQLSchema).to(GraphQLSchema);

// gql types
iocContainer.bind<IGraphQLType>(TYPES.GraphQLType).to(AccountType);
iocContainer.bind<IGraphQLType>(TYPES.GraphQLType).to(AssetType);
iocContainer.bind<IGraphQLType>(TYPES.GraphQLType).to(EventType);
iocContainer.bind<IGraphQLType>(TYPES.GraphQLType).to(BundleType);
iocContainer.bind<IGraphQLType>(TYPES.GraphQLType).to(QueryType);

// gql resolvers
iocContainer.bind<IGraphQLResolver>(TYPES.GraphQLResolver).to(AccountResolver);
iocContainer.bind<IGraphQLResolver>(TYPES.GraphQLResolver).to(AssetResolver);
iocContainer.bind<IGraphQLResolver>(TYPES.GraphQLResolver).to(EventResolver);
iocContainer.bind<IGraphQLResolver>(TYPES.GraphQLResolver).to(BundleResolver);

iocContainer
  .bind<UserPrincipal>(TYPES.UserPrincipal)
  .toDynamicValue((context: interfaces.Context) => {
    return new UserPrincipal();
  });
