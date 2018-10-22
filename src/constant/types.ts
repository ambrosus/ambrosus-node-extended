export const TYPES: any = {
  App: Symbol('App'),
  MongoDBClient: Symbol.for('MongoDBClient'),

  RootController: Symbol('RootController'),
  GraphQLController: Symbol('GraphQLController'),

  AccountController: Symbol('AccountController'),
  AssetController: Symbol('AssetController'),
  EventController: Symbol('EventController'),
  BundleController: Symbol('BundleController'),

  AuthService: Symbol.for('AuthService'),
  DBService: Symbol.for('DBService'),
  Web3Service: Symbol.for('Web3Service'),
  LoggerService: Symbol.for('LoggerService'),

  AccountService: Symbol.for('AccountService'),
  AssetService: Symbol.for('AssetService'),
  EventService: Symbol.for('EventService'),
  BundleService: Symbol.for('BundleService'),

  AuthorizeMiddleware: Symbol.for('AuthorizeMiddleware'),
  ErrorMiddleWare: Symbol.for('ErrorMiddleWare'),

  GraphQLSchema: Symbol('GraphQLSchema'),
  GraphQLType: Symbol('GraphQLType'),
  GraphQLResolver: Symbol('GraphQLResolver'),
};
