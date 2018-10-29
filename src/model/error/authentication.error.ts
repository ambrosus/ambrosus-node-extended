import { AmbrosusError } from './ambrosus.error';

export class AuthenticationError extends AmbrosusError {
  constructor(message) {
    super(`Authentication failed: ${message}`);
  }
}
