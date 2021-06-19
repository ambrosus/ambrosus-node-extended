/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import twilio from 'twilio';
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
        if (config.twilio.sid && config.twilio.authToken) {
            this.client = twilio(config.twilio.sid, config.twilio.authToken);
        }
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
