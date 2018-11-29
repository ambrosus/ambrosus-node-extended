// import { Request, Response, NextFunction } from 'express';
// import { PermissionError } from '../errors';
// import { iocContainer } from '../inversify.config';
// import { TYPE } from '../constant/types';
// import { Principal } from '../model/account';

// export const authorize = (...args) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log(...args);
//       const user: Principal = iocContainer.get<Principal>(TYPE.Principal);

//       if (!user || !user.isAuthorized())
// { return next(new PermissionError({ reason: 'Unauthorized' })); }

//       next();
//     } catch (e) {
//       next(e);
//     }
//   };
// };
