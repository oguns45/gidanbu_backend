// https://cloud.redis.io/#/login
// https://www.youtube.com/watch?v=073xwuL_Rbg 
// How to use Free Hosted Redis Cloud | Node.js + Redis
// SrujanGV

import { createClient } from 'redis';
import colors from 'colors';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Create Redis client with credentials from environment variables
const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000 // 5 seconds timeout
  }
});

// Handle Redis connection errors
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redis.connect();
    console.log(colors.bgCyan("Connected to Redis successfully"));
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

connectRedis();

export { redis };
