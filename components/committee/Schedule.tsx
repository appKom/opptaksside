import ScheduleColumn from "./ScheduleColumn";
import getTimeSlots from "../../lib/utils/getTimeSlots";
import { useState, useEffect } from "react";
import { DeepPartial, applicantType } from "../../lib/types/types";
import ImportantNote from "../ImportantNote";

interface Props {
  interviewLength: number;
  periodTime: any;
  setApplicationData: Function;
  applicationData: DeepPartial<applicantType>;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface IsoTimeSlot {
  start: string;
  end: string;
}

export default function Schedule({
  interviewLength,
  periodTime,
  setApplicationData,
  applicationData,
}: Props) {
  const timeSlots = getTimeSlots(interviewLength);

  const [selectedCells, setSelectedCells] = useState<TimeSlot[]>([]);

  const getDatesWithinPeriod = (
    periodTime: any
  ): { [date: string]: string } => {
    if (!periodTime) return {};
    const startDate = new Date(periodTime.start);
    startDate.setHours(startDate.getHours() + 2);
    const endDate = new Date(periodTime.end);
    endDate.setHours(endDate.getHours() + 2);
    const dates: { [date: string]: string } = {};
    const dayNames = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();
      if (dayIndex !== 0 && dayIndex !== 6) {
        // Exclude Sundays and Saturdays
        const dateStr = currentDate.toISOString().split("T")[0];
        dates[dateStr] = dayNames[dayIndex];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const convertToIso = (slots: {
    date: string;
    times: string[];
  }): IsoTimeSlot => {
    const [startSlot, endSlot] = [
      slots.times[0],
      slots.times[slots.times.length - 1],
    ];
    const [startDateStr, endDateStr] = [slots.date, slots.date];

    const [startTimeStr] = startSlot.split(" - ");
    const [, endTimeStr] = endSlot.split(" - ");

    const [year, month, day] = slots.date.split("-").map(Number);

    const [startHour, startMinute] = parseTime(startTimeStr);
    const startTime = new Date(
      Date.UTC(year, month - 1, day, startHour, startMinute)
    );

    const [endHour, endMinute] = parseTime(endTimeStr);
    const endTime = new Date(
      Date.UTC(year, month - 1, day, endHour, endMinute)
    );

    return {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    };
  };

  const parseTime = (time: string): [number, number] => {
    const [timeStr, period] = time.split(" ");
    let [hour, minute] = timeStr.split(":").map(Number);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return [hour, minute];
  };

  const groupConsecutiveSlots = (
    slots: { date: string; time: string }[]
  ): { date: string; times: string[] }[] => {
    const groupedSlots: { date: string; times: string[] }[] = [];
    let currentGroup: { date: string; times: string[] } | null = null;

    slots.forEach((slot) => {
      if (
        currentGroup &&
        slot.date === currentGroup.date &&
        slot.time.split(" - ")[0] ===
          currentGroup.times[currentGroup.times.length - 1].split(" - ")[1]
      ) {
        currentGroup.times.push(slot.time);
      } else {
        if (currentGroup) {
          groupedSlots.push(currentGroup);
        }
        currentGroup = { date: slot.date, times: [slot.time] };
      }
    });

    if (currentGroup) {
      groupedSlots.push(currentGroup);
    }

    return groupedSlots;
  };

  useEffect(() => {
    const dates = getDatesWithinPeriod(periodTime);
    const allAvailableTimes: { date: string; time: string }[] = [];

    Object.keys(dates).forEach((date) => {
      timeSlots.forEach((time) => {
        allAvailableTimes.push({ date, time });
      });
    });

    const groupedTimeSlots = groupConsecutiveSlots(allAvailableTimes);

    const isoTimeSlotsForExport = groupedTimeSlots.map((slot) =>
      convertToIso(slot)
    );

    setApplicationData({
      ...applicationData,
      selectedTimes: isoTimeSlotsForExport,
    });
  }, []);

  const handleToggleAvailability = (
    date: string,
    time: string,
    available: boolean
  ) => {
    setSelectedCells((prevCells) => {
      const index = prevCells.findIndex(
        (cell) => cell.date === date && cell.time === time
      );

      let newCells;
      if (index !== -1) {
        newCells = [...prevCells];
        newCells[index] = { date, time, available };
      } else {
        newCells = [...prevCells, { date, time, available }];
      }

      const selectedSet = new Set(
        newCells
          .filter((cell) => !cell.available)
          .map((cell) => `${cell.date}-${cell.time}`)
      );

      const dates = getDatesWithinPeriod(periodTime);
      const dataToSend: { date: string; time: string }[] = [];
      Object.keys(dates).forEach((date) => {
        timeSlots.forEach((slot) => {
          const slotKey = `${date}-${slot}`;
          if (!selectedSet.has(slotKey)) {
            dataToSend.push({ date, time: slot });
          }
        });
      });

      const groupedTimeSlots = groupConsecutiveSlots(dataToSend);

      const isoTimeSlotsForExport = groupedTimeSlots.map((slot) =>
        convertToIso(slot)
      );

      setApplicationData({
        ...applicationData,
        selectedTimes: isoTimeSlotsForExport,
      });

      return newCells;
    });
  };

  const dates = getDatesWithinPeriod(periodTime);

  return (
    <div className="flex flex-col items-center">
      <ImportantNote
        prefix="Valgfritt"
        text={
          <>
            Legg inn tider du&nbsp;<span className="font-bold">IKKE</span>
            &nbsp;er ledig for intervju. Flere ledige tider øker sjansen for
            automatisk tildeling av intervjutider!
          </>
        }
      />
      <div className="flex gap-10">
        <AvailabilityIndicator isAvailable />
        <AvailabilityIndicator />
      </div>
      <div className="flex px-5 py-4 mt-5 border border-gray-200 rounded-md shadow w-max dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col justify-end">
          {timeSlots.map((time, index) => (
            <div
              className="flex items-center justify-center h-8 px-4 text-sm border-t border-gray-500"
              key={index}
            >
              {time}
            </div>
          ))}
        </div>
        {Object.keys(dates).map((date, index) => (
          <ScheduleColumn
            date={date}
            weekDay={dates[date]}
            interviewLength={interviewLength}
            onToggleAvailability={handleToggleAvailability}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

const AvailabilityIndicator = ({ isAvailable }: { isAvailable?: boolean }) => {
  return (
    <div className="flex items-center gap-2 text-gray-700 dark:text-white">
      <div
        className={`w-16 h-8 border border-gray-300 rounded-sm dark:border-gray-700 ${
          isAvailable ? "bg-green-300" : "bg-red-300"
        }`}
      ></div>
      <div>
        Jeg er {!isAvailable && <span className="font-bold">IKKE</span>} ledig
      </div>
    </div>
  );
};
