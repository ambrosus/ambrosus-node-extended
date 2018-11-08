import { AmbrosusError } from './ambrosus.error';

export class RepositoryError extends AmbrosusError {
  constructor(message) {
    super(`Repository error: ${message}`, 400);
  }
}
