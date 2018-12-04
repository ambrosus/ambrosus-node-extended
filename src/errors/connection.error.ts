import { AmbrosusError } from './ambrosus.error';

export class ConnectionError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Connection error:`);
    this.name = 'ConnectionError';
  }
}
