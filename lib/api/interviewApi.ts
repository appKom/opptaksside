import { algorithmType, MatchingResult } from "../types/types";

export const fetchInterviewsByPeriod = (
  periodId: string,
): Promise<algorithmType[]> => {
  // TODO: Actual code
  return Promise.resolve([
    {
      applicantId: "66b8ad2fbf3bba34ee2f6b95",
      interviews: [
        {
          start: "2024-08-21T14:30:00+00:00",
          end: "2024-08-21T14:45:00+00:00",
          committeeName: "bedkom",
          room: "",
        },
        {
          start: "2024-08-22T11:15:00+00:00",
          end: "2024-08-22T11:30:00+00:00",
          committeeName: "arrkom",
          room: "",
        },
        {
          start: "2024-08-20T08:45:00+00:00",
          end: "2024-08-20T09:00:00+00:00",
          committeeName: "online-il",
          room: "",
        },
      ],
    },
  ]);
};
