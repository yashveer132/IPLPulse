import { ApiResponse } from '../utils/index.js';

export const getHealth = (_req, res) => {
  ApiResponse(res, {
    message: 'IPLPulse API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};
