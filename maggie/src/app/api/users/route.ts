import { clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  // Extract query params
  // const { limit, offset, order_by, email_address } = req.query;

  // Prepare options object
  const options: Record<string, unknown> = {};

  // if (limit) options.limit = parseInt(limit as string, 10);
  // if (offset) options.offset = parseInt(offset as string, 10);
  // if (order_by) options.orderBy = order_by as string;
  // if (email_address) options.emailAddress = email_address as string;

  // Fetch users from Clerk
  const client = await clerkClient();
  const users = await client.users.getUserList(
    options as unknown as Record<string, unknown>,
  );

  return NextResponse.json(users.data);
}
