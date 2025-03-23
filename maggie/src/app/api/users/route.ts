import { clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
    // Extract query params
    // const { limit, offset, order_by, email_address } = req.query;

    // Prepare options object
    const options: any = {};

    // if (limit) options.limit = parseInt(limit as string, 10);
    // if (offset) options.offset = parseInt(offset as string, 10);
    // if (order_by) options.orderBy = order_by as string;
    // if (email_address) options.emailAddress = email_address as string;

    // Fetch users from Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList(options);
    console.log(users);

    return NextResponse.json(users.data);
}