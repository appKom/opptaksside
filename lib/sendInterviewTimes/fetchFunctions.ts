import SuperJSON from "superjson";
import { committeeEmails } from "../types/types";
import { Group } from "../../pages/api/auth/[...nextauth]";

const API_BASE_URL = "https://rpc.online.ntnu.no/api/trpc";

export const fetchCommitteeEmails = async (): Promise<committeeEmails[]> => {
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

    // TODO: Ta med komité-id (finnes det i det hele tatt?)
    const committees = committeeData.map((committee: Group) => ({
      name_short: committee.slug,
      email: committee.email,
    }));

    return committees;
  } catch (error) {
    console.error(error);
    return [];
  }
};
