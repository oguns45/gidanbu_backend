// import { redis } from "../config/redis";

// /**
//  * Stores a refresh token in Redis with a 7-day expiration.
//  *
//  * @param userId - The ID of the user.
//  * @param refreshToken - The refresh token to be stored.
//  */
// const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
//   await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
// };

// export default storeRefreshToken;








import { redis } from "../config/redis";

/**
 * Stores a refresh token in Redis with a 7-day expiration.
 *
 * @param userId - The ID of the user.
 * @param refreshToken - The refresh token to be stored.
 */
const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  try {
    // Store the refresh token with an expiration time of 7 days
    await redis.set(`refresh_token:${userId}`, refreshToken, {
      EX: 7 * 24 * 60 * 60, // 7 days
    });
    console.log(`Refresh token for user ${userId} stored successfully.`);
  } catch (err) {
    console.error(`Error storing refresh token for user ${userId}:`, err);
  }
};

export default storeRefreshToken;
