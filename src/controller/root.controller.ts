import { controller, httpGet } from 'inversify-express-utils';

@controller('/')
export class RootController {
  @httpGet('/')
  public get(): string {
    return '<h1>Welcome to the Hermes extended API</h1>';
  }
}
