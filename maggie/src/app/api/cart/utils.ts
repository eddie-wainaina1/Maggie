import redis from "@/cache/redis";

// Utility function to retrieve the cart from Redis
export const getCart = async (deviceId: string) => {
  const cart = await redis.get(deviceId);
  return cart ? JSON.parse(cart) : {};
};
