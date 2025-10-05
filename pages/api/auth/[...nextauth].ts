import NextAuth, { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import SuperJSON from "superjson";
import createTRPCUntypedClient from "@trpc/react-query";

const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

// createTRPCUntypedClient();

// TODO: Use superjson

// TODO: Move to config file
const API_BASE_URL = "https://rpc.online.ntnu.no/api/trpc";

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      issuer: process.env.AUTH0_ISSUER,
      style: {
        logo: "/auth0.svg",
        logoDark: "/auth0-dark.svg",
        bg: "#fff",
        text: "#EB5424",
        bgDark: "#fff",
        textDark: "#161b22",
      },

      async profile(profile, tokens) {
        try {
          const headers = {
            Authorization: `Bearer ${tokens.access_token}`,
          };

          const userUrl = `${API_BASE_URL}/user.getMe`;
          const userResponse = await fetch(userUrl, { headers });
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user profile");
          }
          // TODO: Ensure type safety

          // TODO: Use superjson
          const userInfoSerialized = await userResponse.json();
          const userInfo = userInfoSerialized.result.data.json;
          console.log(userInfo); // TODO: Remove

          // Check if user is committee
          const isStaffResponse = await fetch(`${API_BASE_URL}/user.isStaff`, {
            headers,
          });
          if (!isStaffResponse.ok)
            throw new Error("Failed to fetch staff status");
          const isCommittee = await isStaffResponse.json();
          console.log("isCommittee: ", isCommittee);

          // Get committees of user
          const commiteeUrl = `${API_BASE_URL}/group.allByMember?input=${encodeURIComponent(
            SuperJSON.stringify({ userId: userInfo.id })
          )}`;

          const committeeResponse = await fetch(commiteeUrl, {
            method: "GET", // GET works for read queries
            headers: { "content-type": "application/json", ...headers },
          });
          if (!committeeResponse.ok) {
            console.log(committeeResponse);
            throw new Error("Failed to fetch committees");
          }

          const committeeData = await committeeResponse.json();

          // TODO: Ta med komité-id
          const committees = committeeData.results.map((committee: any) => ({
            name: committee.name_short,
            id: committee.id,
          }));

          console.log("Committees: ");
          console.log(committees);

          return {
            id: userInfo.id,
            subId: profile.sub,
            name: userInfo.name,
            email: profile.email,
            //phone: userInfo.phone_number,
            //grade: userInfo.year,
            committees: committees,
            isCommittee: isCommittee,
          };
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch user profile");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // server side
    async jwt({ token, account, user }) {
      try {
        if (account && account.access_token) {
          token.accessToken = account?.access_token;
        }
        if (user) {
          token.id = user.id;
          token.phone = user.phone;
          token.grade = user.grade;
          token.subId = user.subId;
          token.committees = user.committees;
          token.isCommittee = user.isCommittee;
          token.role = adminEmails.includes(user.email) ? "admin" : "user";
        }
        return token;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user profile");
      }
    },
    // client side
    async session({ session, token }) {
      try {
        if (session.user) {
          session.accessToken = token.accessToken as string;

          session.user.role = token.role as "admin" | "user";
          session.user.owId = token.subId as string;
          session.user.phone = token.phone as string;
          session.user.grade = token.grade as number;
          session.user.id = token.id as string;
          session.user.committees = token.committees as string[];
          session.user.isCommittee = token.isCommittee as boolean;
        }
        return session;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user profile");
      }
    },
  },
};

export default NextAuth(authOptions);
