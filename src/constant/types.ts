export const TYPES: any = {
  App: Symbol('App'),
  DBClient: Symbol.for('DBClient'),

  RootController: Symbol('RootController'),
  GraphQLController: Symbol('GraphQLController'),

  AccountController: Symbol('AccountController'),
  AnalyticsController: Symbol('AnalyticsController'),
  AssetController: Symbol('AssetController'),
  EventController: Symbol('EventController'),
  BundleController: Symbol('BundleController'),

  AuthService: Symbol.for('AuthService'),
  Web3Service: Symbol.for('Web3Service'),
  LoggerService: Symbol.for('LoggerService'),

  AccountService: Symbol.for('AccountService'),
  AssetService: Symbol.for('AssetService'),
  EventService: Symbol.for('EventService'),
  BundleService: Symbol.for('BundleService'),

  AccountRepository: Symbol.for('AccountRepository'),
  AssetRepository: Symbol.for('AssetRepository'),
  EventRepository: Symbol.for('EventRepository'),
  BundleRepository: Symbol.for('BundleRepository'),

  AuthorizedMiddleware: Symbol.for('AuthorizedMiddleware'),
  ErrorMiddleWare: Symbol.for('ErrorMiddleWare'),

  GraphQLSchema: Symbol('GraphQLSchema'),
  GraphQLType: Symbol('GraphQLType'),
  GraphQLResolver: Symbol('GraphQLResolver'),

  AccessLevel: Symbol('AccessLevel'),
};
