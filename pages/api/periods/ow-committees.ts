import { NextApiRequest, NextApiResponse } from "next";
import { authOptions, Group } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { hasSession } from "../../../lib/utils/apiChecks";
import { owCommitteeType } from "../../../lib/types/types";
import SuperJSON from "superjson";

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

    const committeeData: Group[] = SuperJSON.parse(
      JSON.stringify((await committeeResponse.json()).result.data)
    );

    const excludedCommitteeNames = ["HS"];

    // TODO: Ta med komité-id (finnes det i det hele tatt?)
    const committees: owCommitteeType[] = committeeData
      .filter((group: Group) => group.type == "COMMITTEE")
      .filter(
        (group: Group) => !excludedCommitteeNames.includes(group.name) // Exclude committees by name_short
      )
      .map((group: Group) => ({
        name_short: group.abbreviation,
        name_long: group.name,
        email: group.email,
        description_short: group.shortDescription,
        description_long: group.description,
        image: { xs: group.imageUrl, sm: group.imageUrl }, // TODO: Update to reflect new api
        application_description: group.description,
      }));

    return res.status(200).json(committees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

export default handler;
