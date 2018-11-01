import { AmbrosusError } from './ambrosus.error';

export class ConnectionError extends AmbrosusError {
  constructor(message) {
    super(`Connection error: ${message}`, 500);
  }
}
