import redis from '@/cache/redis';
import { getDeviceId } from '@/cache/utils';
import { NextApiRequest, NextApiResponse } from 'next';

// Utility function to retrieve the cart from Redis
const getCart = async (deviceId: string) => {
  const cart = await redis.get(deviceId);
  return cart ? JSON.parse(cart) : [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  const deviceId = req.cookies.deviceId || getDeviceId();

  switch (action) {
    case 'add': {
      const { product } = req.body;
      const cart = await getCart(deviceId);
      const updatedCart = [...cart, product];
      await redis.set(deviceId, JSON.stringify(updatedCart));
      res.status(200).json({ cart: updatedCart });
      break;
    }
    case 'remove': {
      const { productId } = req.body;
      const cart = await getCart(deviceId);
      const updatedCart = cart.filter((item: any) => item.productId !== productId);
      await redis.set(deviceId, JSON.stringify(updatedCart));
      res.status(200).json({ cart: updatedCart });
      break;
    }
    case 'get': {
      const cart = await getCart(deviceId);
      res.status(200).json({ cart });
      break;
    }
    default:
      res.status(400).json({ message: 'Invalid action' });
      break;
  }
}
