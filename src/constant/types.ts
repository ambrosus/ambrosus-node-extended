export const TYPE: any = {
  App: Symbol.for('App'),
  DBClient: Symbol.for('DBClient'),

  RootController: Symbol.for('RootController'),
  GraphQLController: Symbol.for('GraphQLController'),

  AccountController: Symbol.for('AccountController'),
  AnalyticsController: Symbol.for('AnalyticsController'),
  AssetController: Symbol.for('AssetController'),
  EventController: Symbol.for('EventController'),
  BundleController: Symbol.for('BundleController'),
  OrganizationController: Symbol.for('OrganizationController'),

  AuthService: Symbol.for('AuthService'),
  Web3Service: Symbol.for('Web3Service'),
  LoggerService: Symbol.for('LoggerService'),

  AccountService: Symbol.for('AccountService'),
  AssetService: Symbol.for('AssetService'),
  EventService: Symbol.for('EventService'),
  BundleService: Symbol.for('BundleService'),
  AnalyticsService: Symbol.for('AnalyticsService'),
  OrganizationService: Symbol.for('OrganizationService'),

  AccountRepository: Symbol.for('AccountRepository'),
  AssetRepository: Symbol.for('AssetRepository'),
  EventRepository: Symbol.for('EventRepository'),
  BundleRepository: Symbol.for('BundleRepository'),
  OrganizationRepository: Symbol.for('OrganizationRepository'),
  OrganizationRequestRepository: Symbol.for('OrganizationRequestRepository'),

  GraphQLSchema: Symbol.for('GraphQLSchema'),
  GraphQLType: Symbol.for('GraphQLType'),
  GraphQLResolver: Symbol.for('GraphQLResolver'),

  UserPrincipal: Symbol.for('UserPrincipal'),
};

export const MIDDLEWARE: any = {
  Authorized: Symbol.for('AuthorizedMiddleware'),
  ValidateRequest: Symbol.for('ValidateRequestMiddleware'),
};
