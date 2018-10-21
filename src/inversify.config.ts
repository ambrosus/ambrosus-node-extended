import { RequestHandler } from 'express';
import { Container, interfaces } from 'inversify';

import { TYPES } from './constant/types';
import { AccountController } from './controller/account.controller';
import { AssetController } from './controller/asset.controller';
import { BundleController } from './controller/bundle.controller';
import { EventController } from './controller/event.controller';
import { GraphQLController } from './controller/graphql.controller';
import { RootController } from './controller/root.controller';
import {
  GraphQLSchema,
  IGraphQLResolver,
  IGraphQLSchema,
  IGraphQLType
} from './graphql';
import { AccountResolver } from './graphql/resolver/account.resolver';
import {
  AccountType,
  AssetType,
  BundleType,
  EventType,
  QueryType
} from './graphql/type';
import {
  authorizeMiddlewareFactory,
  errorMiddlewareFactory
} from './middleware';
import { AccountService } from './service/account.service';
import { AssetService } from './service/asset.service';
import { AuthService } from './service/auth.service';
import { BundleService } from './service/bundle.service';
import { EventService } from './service/event.service';
import { LoggerService } from './service/logger.service';
import { Web3Service } from './service/web3.service';
import { MongoDBClient } from './util/mongodb/client';

export const iocContainer: Container = new Container();

// db
iocContainer
  .bind<MongoDBClient>(TYPES.MongoDBClient)
  .to(MongoDBClient)
  .inSingletonScope();

// controllers
iocContainer.bind<RootController>(TYPES.RootController).to(RootController);
iocContainer
  .bind<GraphQLController>(TYPES.GraphQLController)
  .to(GraphQLController);
iocContainer
  .bind<AccountController>(TYPES.AccountController)
  .to(AccountController);
iocContainer.bind<AssetController>(TYPES.AssetController).to(AssetController);
iocContainer.bind<EventController>(TYPES.EventController).to(EventController);
iocContainer.bind<BundleController>(TYPES.BundleController).to(BundleController);

// services
iocContainer
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
iocContainer
  .bind<Web3Service>(TYPES.Web3Service)
  .to(Web3Service)
  .inSingletonScope();
iocContainer
  .bind<LoggerService>(TYPES.LoggerService)
  .to(LoggerService)
  .inSingletonScope();
iocContainer
  .bind<AccountService>(TYPES.AccountService)
  .to(AccountService)
  .inSingletonScope();
iocContainer
  .bind<AssetService>(TYPES.AssetService)
  .to(AssetService)
  .inSingletonScope();
iocContainer
  .bind<EventService>(TYPES.EventService)
  .to(EventService)
  .inSingletonScope();
iocContainer
  .bind<BundleService>(TYPES.BundleService)
  .to(BundleService)
  .inSingletonScope();

// middleware
iocContainer
  .bind<RequestHandler>(TYPES.AuthorizeMiddleWare)
  .toDynamicValue((context: interfaces.Context) => {
    const authService: AuthService = context.container.get(TYPES.AuthService);
    const loggerService: LoggerService = context.container.get(
      TYPES.LoggerService
    );
    return authorizeMiddlewareFactory(authService, loggerService);
  });

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
