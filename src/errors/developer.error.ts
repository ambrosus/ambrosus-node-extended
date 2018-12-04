import { AmbrosusError } from './ambrosus.error';

export class DeveloperError extends AmbrosusError {
    constructor(error, message = '') {
        super(error, `Developer error:`);
        this.name = 'DeveloperError';
    }
}
