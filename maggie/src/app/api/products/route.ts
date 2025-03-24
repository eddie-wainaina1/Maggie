import type { NextApiRequest } from "next";

export async function GET (req: NextApiRequest) {
    const { _id } = req.query;
    return new Response();
}
