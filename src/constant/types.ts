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

export const TYPE: any = {
  App: Symbol.for('App'),
  DBClient: Symbol.for('DBClient'),

  RootController: Symbol.for('RootController'),
  GraphQLController: Symbol.for('GraphQLController'),

  AccountController: Symbol.for('AccountController'),
  Account2Controller: Symbol.for('Account2Controller'),
  AnalyticsController: Symbol.for('AnalyticsController'),
  AssetController: Symbol.for('AssetController'),
  Asset2Controller: Symbol.for('Asset2Controller'),
  EventController: Symbol.for('EventController'),
  Event2Controller: Symbol.for('Event2Controller'),
  BundleController: Symbol.for('BundleController'),
  Bundle2Controller: Symbol.for('Bundle2Controller'),
  OrganizationController: Symbol.for('OrganizationController'),
  Organization2Controller: Symbol.for('Organization2Controller'),
  OrganizationRequestController: Symbol.for('OrganizationRequestController'),
  OrganizationInviteController: Symbol.for('OrganizationInviteController'),
  MobileController: Symbol.for('MobileController'),

  MetricController: Symbol.for('MetricController'),
  HealthController: Symbol.for('HealthController'),

  AuthService: Symbol.for('AuthService'),
  Web3Service: Symbol.for('Web3Service'),
  LoggerService: Symbol.for('LoggerService'),

  AccountService: Symbol.for('AccountService'),
  AssetService: Symbol.for('AssetService'),
  EventService: Symbol.for('EventService'),
  BundleService: Symbol.for('BundleService'),
  AnalyticsService: Symbol.for('AnalyticsService'),
  OrganizationService: Symbol.for('OrganizationService'),
  EmailService: Symbol.for('EmailService'),
  MobileService: Symbol.for('MobileService'),

  AccountRepository: Symbol.for('AccountRepository'),
  AccountDetailRepository: Symbol.for('AccountDetailRepository'),
  AssetRepository: Symbol.for('AssetRepository'),
  EventRepository: Symbol.for('EventRepository'),
  BundleRepository: Symbol.for('BundleRepository'),
  OrganizationRepository: Symbol.for('OrganizationRepository'),
  OrganizationRequestRepository: Symbol.for('OrganizationRequestRepository'),
  OrganizationInviteRepository: Symbol.for('OrganizationInviteRepository'),

  GraphQLSchema: Symbol.for('GraphQLSchema'),
  GraphQLType: Symbol.for('GraphQLType'),
  GraphQLResolver: Symbol.for('GraphQLResolver'),

  UserPrincipal: Symbol.for('UserPrincipal'),
};

export const MIDDLEWARE: any = {
  Context: Symbol.for('Context'),
};
