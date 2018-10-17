import { expect } from 'chai';
import { RootController } from '../../src/controller/root.controller';

describe('HomeController', () => {
  it('should give back `Welcome to the Hermes extended API`', () => {
    let service = new RootController();

    expect(service.get()).to.equal('Welcome to the Hermes extended API');
  });
});
