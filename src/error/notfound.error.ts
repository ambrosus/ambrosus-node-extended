import { AmbrosusError } from './ambrosus.error';

export class NotFoundError extends AmbrosusError {
  constructor(message) {
    super(`Not found: ${message}`);
  }
}
