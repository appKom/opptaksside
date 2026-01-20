import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { hasSession } from "../../../lib/utils/apiChecks";
import SuperJSON from "superjson";
import { OwGroup } from "../../../lib/types/types";

const API_BASE_URL = "https://rpc.online.ntnu.no/api/trpc";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!hasSession(res, session)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} is not allowed.`);
  }

  try {
    const commiteeUrl = `${API_BASE_URL}/group.all`;

    const committeeResponse = await fetch(commiteeUrl, {
      method: "GET", // GET works for read queries
      headers: { "content-type": "application/json" },
    });

    if (!committeeResponse.ok) {
      throw new Error("Failed to fetch committees");
    }

    const committeeData: OwGroup[] = SuperJSON.parse(
      JSON.stringify((await committeeResponse.json()).result.data),
    );

    // TODO: Ta med komité-id (finnes det i det hele tatt?)
    const committees: OwGroup[] = committeeData.filter(
      (group: OwGroup) =>
        group.recruitmentMethod == "SPRING_APPLICATION" ||
        group.recruitmentMethod == "AUTUMN_APPLICATION",
    );

    return res.status(200).json(committees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

export default handler;
