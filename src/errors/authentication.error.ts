import { AmbrosusError } from './ambrosus.error';

export class AuthenticationError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Authentication failed:`);
    this.name = 'AuthenticationError';
  }
}
