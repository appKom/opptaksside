import toast from "react-hot-toast";
import { MatchingResult, periodType } from "../lib/types/types";
import Button from "./Button";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getInterviewsByPeriod } from "../lib/mongo/interviews";
import { fetchInterviewsByPeriod } from "../lib/api/interviewApi";

interface Props {
  period: periodType | null;
}

const SendOutInterviews = ({ period }: Props) => {
  const queryClient = useQueryClient();

  const [isWaitingOnMatching, setIsWaitingOnMatching] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null,
  );

  useEffect(() => {
    if (!period?._id) return;

    fetchInterviewsByPeriod(period?._id.toString()).then((result) => {
      const total_number_of_interviews =
        result.reduce(
          (current_sum, { interviews }) => current_sum + interviews.length,
          0,
        ) ?? 0;
      setMatchingResult({
        matched_meetings: total_number_of_interviews,
        total_wanted_meetings: 3,
      });
    });
  }, [period]);

  const runMatching = async ({ periodId }: { periodId: string }) => {
    const confirm = window.confirm(
      "Er du sikker på at du vil matche intervjuer?",
    );

    if (!confirm) return;

    try {
      const response = await fetch(`/api/periods/match-interviews/${periodId}`);

      if (!response.ok) {
        throw new Error("Failed to match interviews");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      toast.success("Intervjuene ble matchet!");

      return data;
    } catch (error) {
      toast.error("Mathcing av intervjuer feilet");
      console.error(error);
    }
  };

  const sendOutInterviewTimes = async ({ periodId }: { periodId: string }) => {
    const confirm = window.confirm(
      "Er du sikker på at du vil sende ut intervjutider?",
    );

    if (!confirm) return;

    try {
      const response = await fetch(
        `/api/periods/send-interview-times/${periodId}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to send out interview times");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      toast.success("Intervjutider er sendt ut! (Sjekk konsoll loggen)");
      return data;
    } catch (error) {
      toast.error("Klarte ikke å sende ut intervjutider");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        title={isWaitingOnMatching ? "Kjører matching..." : "Kjør matching"}
        color={"blue"}
        disabled={period?.hasMatchedInterviews || isWaitingOnMatching}
        onClick={async () => {
          setIsWaitingOnMatching(true);
          await runMatching({ periodId: period!._id.toString() }).then(
            (result) => {
              setIsWaitingOnMatching(false);
              setMatchingResult(result);

              // refetch state
              queryClient.invalidateQueries({
                queryKey: ["periods", period?._id],
              });
            },
          );
        }}
      />

      {period?.hasMatchedInterviews && matchingResult != null && (
        <div>
          <p>
            Klarte å matche {matchingResult.matched_meetings} av{" "}
            {matchingResult.total_wanted_meetings}
          </p>
        </div>
      )}

      <Button
        title={"Send ut intervjutider"}
        color={"blue"}
        disabled={
          !period?.hasMatchedInterviews && !period?.hasSentInterviewTimes
        }
        onClick={async () =>
          await sendOutInterviewTimes({ periodId: period!._id.toString() })
        }
      />
    </div>
  );
};

export default SendOutInterviews;
