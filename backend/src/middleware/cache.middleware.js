import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export const cacheMiddleware = (duration = 900) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    } else {
      const originalJson = res.json;
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, duration);
        }
        originalJson.call(res, body);
      };
      next();
    }
  };
};

export const clearCache = () => {
  cache.flushAll();
};
