import { AmbrosusError } from './ambrosus.error';

export class CreateError extends AmbrosusError {
    constructor(error, message = '') {
        super(error, `Unable to create :`);
        this.name = 'CreateError';
    }
}
