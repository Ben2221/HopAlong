import { Request, Response, NextFunction } from 'express';

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - user is added by authenticate middleware
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      status: 'error', 
      message: 'Access denied. Administrator privileges required.' 
    });
  }
};
