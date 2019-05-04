/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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

export const config: any = {
  port: process.env.PORT || 3000,
  paginationMax: process.env.PAGINATION_MAX || 50,
  paginationDefault: process.env.PAGINATION_DEFAULT || 10,
  sentryDsn: process.env.SENTRY_DSN,
  dashboardUrl: process.env.DASHBOARD_URL,
  encryptionKey: process.env.ENCRYPTION_KEY,
  db: {
    hosts: process.env.MONGO_HOSTS || 'localhost:27017',
    dbName: process.env.MONGO_DB_NAME || 'hermes',
    resplicaset: process.env.MONGO_REPLICA_SET || '',
    user: process.env.MONGO_USER || '',
    pass: process.env.MONGO_PASSWORD || '',
  },
  web3: {
    rpc: process.env.WEB3_RPC || 'http://10.60.148.63:8545',
    privateKey:
      process.env.WEB3_NODEPRIVATEKEY ||
      '0xf05f6b45d9b615a21a4445a03d45b087608290cd436d6d836e2344dc7a715346',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  email: {
    api: process.env.EMAIL_API_KEY,
    defaultFrom: process.env.EMAIL_DEFAULT_FROM || 'no-reply@ambrosus.com',
    orgReqTo: process.env.EMAIL_ORGREQ_TO,
    templateIdInvite: process.env.EMAIL_TMPL_ID_INVITE,
    templateIdOrgReq: process.env.EMAIL_TMPL_ID_ORGREQ,
    templateIdOrgReqApprove: process.env.EMAIL_TMPL_ID_ORGREQ_APPROVE,
    templateIdOrgReqRefuse: process.env.EMAIL_TMPL_ID_ORGREQ_REFUSE,
  },
  twilio: {
    sid: 'ACbd182f15b349d4ad7caa2ca92508b3e7',
    authToken: '13f8a1ca902c6bf448088032b2bf3896',
    number: '+13347216481',
  },
};
