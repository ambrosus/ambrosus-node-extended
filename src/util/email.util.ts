import * as sgMail from '@sendgrid/mail';
import {config } from '../config';

sgMail.setApiKey(config.email.api);
export const sendEmail = (from, to, subject, html) => {
  return sgMail.send({
    from,
    to,
    subject,
    html,
  });
};
