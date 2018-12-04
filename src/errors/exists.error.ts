import { AmbrosusError } from './ambrosus.error';

export class ExistsError extends AmbrosusError {
    constructor(error, message = '') {
        super(error, `Exists :`);
        this.name = 'ExistsError';
    }
}
