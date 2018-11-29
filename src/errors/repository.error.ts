import { AmbrosusError } from './ambrosus.error';

export class RepositoryError extends AmbrosusError {
  constructor(error, message = '') {
    super(error, `Repository error:`);
    this.name = 'RepositoryError';
  }
}
