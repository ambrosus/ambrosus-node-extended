import { AmbrosusError } from './ambrosus.error';

export class ExpiredError extends AmbrosusError {
  constructor(message) {
    super(`Expired: ${message}`, 400);
  }
}
