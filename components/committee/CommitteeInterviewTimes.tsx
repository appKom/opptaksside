import { BaseSyntheticEvent, useEffect, useRef } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import FullCalendar from "@fullcalendar/react";
import { periodType, committeeInterviewType } from "../../lib/types/types";
import toast from "react-hot-toast";
import NotFound from "../../pages/404";
import Button from "../Button";
import ImportantNote from "../ImportantNote";
import useUnsavedChangesWarning from "../../lib/utils/unSavedChangesWarning";
import { SimpleTitle } from "../Typography";
import { useQuery } from "@tanstack/react-query";
import { fetchApplicantsByPeriodIdAndCommittee } from "../../lib/api/applicantApi";
import { RoomBookingCalendar } from "./RoomBookingCalendar";

interface Interview {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface Props {
  period: periodType | null;
  committee: string;
  committeeInterviewTimes: committeeInterviewType | null;
}

const INTERVIEW_TIME_OPTIONS = ["15", "20", "30"];

const CommitteeInterviewTimes = ({
  period,
  committee,
  committeeInterviewTimes,
}: Props) => {
  const { data: session } = useSession();
  const [interviewInterval, setInterviewInterval] = useState(15);
  const [visibleRange, setVisibleRange] = useState({ start: "", end: "" });

  const [selectedTimeslot, setSelectedTimeslot] = useState<string>("15");
  const [interviewsPlanned, setInterviewsPlanned] = useState<number>(0);

  const [calendarEvents, setCalendarEvents] = useState<Interview[]>([]);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] =
    useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSelection, setCurrentSelection] = useState<any>(null);
  const [roomInput, setRoomInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const [deadLineHasPassed, setDeadLineHasPassed] = useState<boolean>(false);

  const { unsavedChanges, setUnsavedChanges } = useUnsavedChangesWarning();

  const [numberOfApplications, setNumberOfApplications] = useState<number>(0);

  useEffect(() => {
    if (period) {
      setVisibleRange({
        start: new Date(period!.interviewPeriod.start).toISOString(),
        end: new Date(period!.interviewPeriod.end).toISOString(),
      });
    }
  }, [period]);

  const {
    data: applicantsData,
    isError: applicantsIsError,
    isLoading: applicantsIsLoading,
  } = useQuery({
    queryKey: ["applicants", period?._id, committee],
    queryFn: fetchApplicantsByPeriodIdAndCommittee,
  });

  useEffect(() => {
    if (applicantsData) {
      setNumberOfApplications(applicantsData.applicants.length);
    }
  }, [applicantsData]);

  useEffect(() => {
    if (committee && committeeInterviewTimes) {
      const cleanString = (input: string) =>
        input
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          .trim()
          .toLowerCase();

      const cleanCommittee = cleanString(committeeInterviewTimes.committee);
      const cleanSelectedCommittee = cleanString(committee);

      if (cleanCommittee === cleanSelectedCommittee) {
        setHasAlreadySubmitted(true);
        const events = committeeInterviewTimes.availabletimes.map(
          (at: any) => ({
            id: crypto.getRandomValues(new Uint32Array(1))[0].toString(),
            title: at.room,
            start: new Date(at.start).toISOString(),
            end: new Date(at.end).toISOString(),
          })
        );

        setCalendarEvents(events);
        setSelectedTimeslot(committeeInterviewTimes.timeslot);
      } else {
        setHasAlreadySubmitted(false);
        setCalendarEvents([]);
        setSelectedTimeslot("15");
      }
    }
  }, [committeeInterviewTimes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        if (event.key === "Enter") {
          handleRoomSubmit();
        } else if (event.key === "Escape") {
          setIsModalOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, roomInput]);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (calendarEvents.length > 0) {
      calculateInterviewsPlanned();
    }

    if (!calendarEvents || calendarEvents.length === 0) {
      setInterviewsPlanned(0);
    }
  }, [calendarEvents, selectedTimeslot]);

  useEffect(() => {
    if (period) {
      setCountdown(getSubmissionDeadline());
      const intervalId = setInterval(() => {
        setCountdown(getSubmissionDeadline());
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [period]);

  const handleRoomSubmit = () => {
    if (!roomInput) {
      toast.error("Vennligst skriv inn et romnavn");
      return;
    }

    const event: Interview = {
      id: crypto.getRandomValues(new Uint32Array(1))[0].toString(),
      title: roomInput,
      start: currentSelection.start.toISOString(),
      end: currentSelection.end.toISOString(),
    };

    const calendarApi = currentSelection.view.calendar;
    calendarApi.addEvent(event);
    calendarApi.render();

    setRoomInput("");
    setIsModalOpen(false);
    setCalendarEvents((prevEvents) => [...prevEvents, event]);
  };

  const submit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    const formattedEvents = formatEventsForExport(calendarEvents);
    if (formattedEvents.length === 0) {
      toast.error("Fyll inn minst et gyldig tidspunkt");
      return;
    }

    const dataToSend = {
      periodId: period!._id,
      period_name: period!.name,
      committee: committee,
      availabletimes: formattedEvents,
      timeslot: `${selectedTimeslot}`,
      message: "",
    };

    try {
      const response = await fetch(`/api/committees/times/${period?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      const result = await response.json();
      toast.success("Tidene er sendt inn!");
      setHasAlreadySubmitted(true);
      setUnsavedChanges(false);
    } catch (error) {
      toast.error("Kunne ikke sende inn!");
    }
  };

  const updateInterviewInterval = (e: BaseSyntheticEvent) => {
    setInterviewInterval(parseInt(e.target.value));
    setUnsavedChanges(true);
  };

  const formatEventsForExport = (events: Interview[]) => {
    return events.map((event) => {
      const startDateTime = new Date(event.start);
      const endDateTime = new Date(event.end);
      return {
        room: event.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      };
    });
  };

  const handleTimeslotSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeslot(e.target.value);
    setUnsavedChanges(true);
  };

  const deleteSubmission = async (e: BaseSyntheticEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/committees/times/${period?._id}/${committee}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      toast.success("Innsendingen er slettet!");

      setHasAlreadySubmitted(false);
      setCalendarEvents([]);
      setInterviewsPlanned(0);
      setUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error deleting submission:", error);
      toast.error("Klarte ikke å slette innsendingen");
    }
  };

  const getSubmissionDeadline = (): string => {
    const deadlineIso = period!.applicationPeriod.end;

    if (deadlineIso != null && !deadLineHasPassed) {
      const deadlineDate = new Date(deadlineIso);
      const now = new Date();

      if (now > deadlineDate) {
        setDeadLineHasPassed(true);
      }

      let delta = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000);

      const days = Math.floor(delta / 86400);
      delta -= days * 86400;

      const hours = Math.floor(delta / 3600) % 24;
      delta -= hours * 3600;

      const minutes = Math.floor(delta / 60) % 60;
      delta -= minutes * 60;

      const seconds = delta % 60;

      let result = "";
      if (days > 0) result += `${days} dager, `;
      if (hours > 0) result += `${hours} timer, `;
      if (minutes > 0) result += `${minutes} minutter, `;
      result += `${seconds} sekunder`;

      return result;
    }

    return "";
  };

  const calculateInterviewsPlanned = () => {
    const totalMinutes = calendarEvents.reduce((acc, event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end.getTime() - start.getTime()) / 1000 / 60;
      return acc + duration;
    }, 0);

    const plannedInterviews = Math.floor(
      totalMinutes / parseInt(selectedTimeslot)
    );
    setInterviewsPlanned(plannedInterviews);
  };

  if (!session || !session.user?.isCommittee) {
    return <NotFound />;
  }

  if (deadLineHasPassed)
    return (
      <SimpleTitle
        title="Det er ikke lenger mulig å booke rom for intervjuer"
        size="medium"
      />
    );

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-2 px-5 mt-5 mb-6 text-2xl font-semibold text-center">
        Book rom for intervjuer
      </div>
      <ImportantNote
        prefix="NB"
        text={`Fristen for å booke rom til intervjuer er ${countdown}`}
      />

      <p className="px-5 my-5 text-lg text-center">
        Velg ledige tider ved å trykke på eller dra over flere celler.
        <br />
        Intervjuene vil bli satt opp etter hverandre fra første ledige tid.
      </p>
      <form className="flex flex-col text-center">
        {hasAlreadySubmitted ? (
          <p className="mt-5 mb-6 text-lg text-center">
            Intervjulengde: {selectedTimeslot} min{" "}
          </p>
        ) : (
          <div className="pt-10">
            <label htmlFor="">Intervjulengde: </label>
            <select
              className="dark:bg-online-darkBlue dark:text-white"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => [
                updateInterviewInterval(e),
                handleTimeslotSelection(e),
              ]}
              name=""
              id=""
            >
              {INTERVIEW_TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time} min
                </option>
              ))}
            </select>
          </div>
        )}

        <RoomBookingCalendar />

        {!hasAlreadySubmitted && (
          <label className="block mt-5 mb-2 font-medium text-m">
            Fyll ut ledige tider før du sender.
          </label>
        )}
        <div className="pt-10">
          <Button
            title={hasAlreadySubmitted ? "Slett innsending" : "Lagre og send"}
            onClick={
              hasAlreadySubmitted
                ? deleteSubmission
                : (e: BaseSyntheticEvent) => {
                    submit(e);
                  }
            }
            color={hasAlreadySubmitted ? "orange" : "blue"}
          />
        </div>
      </form>
    </div>
  );
};

export default CommitteeInterviewTimes;
