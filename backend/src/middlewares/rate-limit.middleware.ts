import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: { [key: string]: RateLimitStore } = {};

/**
 * Highly optimized lightweight custom in-memory rate limiter middleware.
 * Fully configurable for custom window windows and thresholds.
 */
export const rateLimiter = (limit: number, windowMs: number, keyPrefix: string = 'global') => {
  if (!stores[keyPrefix]) {
    stores[keyPrefix] = {};
  }
  const store = stores[keyPrefix];

  return (req: Request, res: Response, next: NextFunction) => {
    let ip = req.ip || 'unknown';
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = typeof forwardedFor === 'string' 
        ? forwardedFor.split(',') 
        : Array.isArray(forwardedFor) 
          ? forwardedFor 
          : [];
      if (ips.length > 0) {
        ip = ips[0].trim();
      }
    }
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    const record = store[ip];

    // If window expired, reset counts
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count++;

    // Threshold breach
    if (record.count > limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: `Too many requests on ${keyPrefix} service. Please try again in ${retryAfter} seconds.`,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
};
