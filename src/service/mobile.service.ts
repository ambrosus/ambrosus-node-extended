import * as twilio from 'twilio';
import { inject, injectable } from 'inversify';

import { config } from '../config';
import { TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { UserPrincipal } from '../model';

@injectable()
export class MobileService {
    private client: any;

    constructor(
        @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
        @inject(TYPE.LoggerService) private readonly logger: ILogger
    ) {
        this.client = twilio(config.twilio.sid, config.twilio.authToken);
    }

    public async sendMessage(to: string, body: string) {
        try {
            const options = { to, body, from: config.twilio.number };
            const response = await this.client.messages.create(options);
            console.log('SMS response: ', response);

            return response;
        } catch (error) {
            console.error('SMS: ', error);
            this.handleSendError(error);
        }
    }

    private async handleSendError(error) {
        this.logger.captureError(error);
        const { message, code, response } = error;
        const { headers, body } = response;
        this.logger.error(body);
    }
}
