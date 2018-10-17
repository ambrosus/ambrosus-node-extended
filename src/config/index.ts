export const config: any = {
  port: process.env.PORT || 3000,
  paginationMax: process.env.PAGINATION_MAX || 50,
  paginationDefault: process.env.PAGINATION_DEFAULT || 10,
  db: {
    hosts: process.env.MONGO_HOSTS || 'localhost:27017',
    dbName: process.env.MONGO_DB_NAME || 'hermes',
    resplicaset: process.env.MONGO_REPLICASET || '',
    user: process.env.MONGO_USER || '',
    pass: process.env.MONGO_PASS || '',
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
};
