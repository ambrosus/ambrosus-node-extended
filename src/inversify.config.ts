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

export const container: Container = new Container();

// db
container
  .bind<MongoDBClient>(TYPES.MongoDBClient)
  .to(MongoDBClient)
  .inSingletonScope();

// controllers
container.bind<RootController>(TYPES.RootController).to(RootController);
container
  .bind<GraphQLController>(TYPES.GraphQLController)
  .to(GraphQLController);
container
  .bind<AccountController>(TYPES.AccountController)
  .to(AccountController);
container.bind<AssetController>(TYPES.AssetController).to(AssetController);
container.bind<EventController>(TYPES.EventController).to(EventController);
container.bind<BundleController>(TYPES.BundleController).to(BundleController);

// services
container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<Web3Service>(TYPES.Web3Service)
  .to(Web3Service)
  .inSingletonScope();
container
  .bind<LoggerService>(TYPES.LoggerService)
  .to(LoggerService)
  .inSingletonScope();
container
  .bind<AccountService>(TYPES.AccountService)
  .to(AccountService)
  .inSingletonScope();
container
  .bind<AssetService>(TYPES.AssetService)
  .to(AssetService)
  .inSingletonScope();
container
  .bind<EventService>(TYPES.EventService)
  .to(EventService)
  .inSingletonScope();
container
  .bind<BundleService>(TYPES.BundleService)
  .to(BundleService)
  .inSingletonScope();

// middleware
container
  .bind<RequestHandler>(TYPES.AuthorizeMiddleWare)
  .toDynamicValue((context: interfaces.Context) => {
    const authService: AuthService = context.container.get(TYPES.AuthService);
    const loggerService: LoggerService = context.container.get(
      TYPES.LoggerService
    );
    return authorizeMiddlewareFactory(authService, loggerService);
  });

// gql schema
container.bind<IGraphQLSchema>(TYPES.GraphQLSchema).to(GraphQLSchema);

// gql types
container.bind<IGraphQLType>(TYPES.GraphQLType).to(AccountType);
container.bind<IGraphQLType>(TYPES.GraphQLType).to(AssetType);
container.bind<IGraphQLType>(TYPES.GraphQLType).to(EventType);
container.bind<IGraphQLType>(TYPES.GraphQLType).to(BundleType);
container.bind<IGraphQLType>(TYPES.GraphQLType).to(QueryType);

// gql resolvers
container.bind<IGraphQLResolver>(TYPES.GraphQLResolver).to(AccountResolver);
