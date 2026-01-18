import clsx from "clsx";
import { useState } from "react";

type RoomTime = {
  date: string;
  rooms: Room[];
}

type Room = {
  room: string;
  times: Time[];
}

type Time = {
  time: string;
  committee: string | undefined;
}

const initialRoomTimes: RoomTime[] = [
  {
    date: "29.03",
    rooms: [
      {
        room: "S9",
        times: [
          { time: "8:00", committee: "appkom" },
          { time: "9:00", committee: "appkom" },
          { time: "10:00", committee: "appkom" },
          { time: "11:00", committee: "appkom" },
          { time: "12:00", committee: undefined },
          { time: "13:00", committee: undefined },
          { time: "14:00", committee: "prokom" },
          { time: "15:00", committee: "eeeeeeeeeeeee" },
          { time: "16:00", committee: "prokom" },
          { time: "17:00", committee: "prokom" },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "R3",
        times: [
          { time: "8:00", committee: "dotkom" },
          { time: "9:00", committee: "dotkom" },
          { time: "10:00", committee: "dotkom" },
          { time: "11:00", committee: "dotkom" },
          { time: "12:00", committee: undefined },
          { time: "13:00", committee: "arrkom" },
          { time: "14:00", committee: "arrkom" },
          { time: "15:00", committee: "arrkom" },
          { time: "16:00", committee: "arrkom" },
          { time: "17:00", committee: undefined },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "A4-108",
        times: [
          { time: "8:00", committee: "fagkom" },
          { time: "9:00", committee: "fagkom" },
          { time: "10:00", committee: undefined },
          { time: "11:00", committee: undefined },
          { time: "12:00", committee: "trikom" },
          { time: "13:00", committee: "trikom" },
          { time: "14:00", committee: "trikom" },
          { time: "15:00", committee: "appkom" },
          { time: "16:00", committee: "appkom" },
          { time: "17:00", committee: "appkom" },
          { time: "18:00", committee: undefined }
        ]
      }
    ]
  },
  {
    date: "30.03",
    rooms: [
      {
        room: "S9",
        times: [
          { time: "8:00", committee: "prokom" },
          { time: "9:00", committee: "prokom" },
          { time: "10:00", committee: "prokom" },
          { time: "11:00", committee: "prokom" },
          { time: "12:00", committee: undefined },
          { time: "13:00", committee: "dotkom" },
          { time: "14:00", committee: "dotkom" },
          { time: "15:00", committee: undefined },
          { time: "16:00", committee: "arrkom" },
          { time: "17:00", committee: "arrkom" },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "R3",
        times: [
          { time: "8:00", committee: "fagkom" },
          { time: "9:00", committee: undefined },
          { time: "10:00", committee: undefined },
          { time: "11:00", committee: "trikom" },
          { time: "12:00", committee: "trikom" },
          { time: "13:00", committee: "trikom" },
          { time: "14:00", committee: "appkom" },
          { time: "15:00", committee: "appkom" },
          { time: "16:00", committee: undefined },
          { time: "17:00", committee: "prokom" },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "A4-108",
        times: [
          { time: "8:00", committee: "arrkom" },
          { time: "9:00", committee: "arrkom" },
          { time: "10:00", committee: "arrkom" },
          { time: "11:00", committee: "arrkom" },
          { time: "12:00", committee: "dotkom" },
          { time: "13:00", committee: "dotkom" },
          { time: "14:00", committee: "fagkom" },
          { time: "15:00", committee: "fagkom" },
          { time: "16:00", committee: undefined },
          { time: "17:00", committee: undefined },
          { time: "18:00", committee: undefined }
        ]
      }
    ]
  },
  {
    date: "31.03",
    rooms: [
      {
        room: "S9",
        times: [
          { time: "8:00", committee: "trikom" },
          { time: "9:00", committee: "trikom" },
          { time: "10:00", committee: "trikom" },
          { time: "11:00", committee: undefined },
          { time: "12:00", committee: "fagkom" },
          { time: "13:00", committee: "fagkom" },
          { time: "14:00", committee: undefined },
          { time: "15:00", committee: "dotkom" },
          { time: "16:00", committee: "dotkom" },
          { time: "17:00", committee: "dotkom" },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "R3",
        times: [
          { time: "8:00", committee: "appkom" },
          { time: "9:00", committee: "appkom" },
          { time: "10:00", committee: "appkom" },
          { time: "11:00", committee: undefined },
          { time: "12:00", committee: "arrkom" },
          { time: "13:00", committee: "arrkom" },
          { time: "14:00", committee: "arrkom" },
          { time: "15:00", committee: undefined },
          { time: "16:00", committee: "prokom" },
          { time: "17:00", committee: "prokom" },
          { time: "18:00", committee: undefined }
        ]
      },
      {
        room: "A4-108",
        times: [
          { time: "8:00", committee: "dotkom" },
          { time: "9:00", committee: undefined },
          { time: "10:00", committee: undefined },
          { time: "11:00", committee: "trikom" },
          { time: "12:00", committee: "trikom" },
          { time: "13:00", committee: "appkom" },
          { time: "14:00", committee: "appkom" },
          { time: "15:00", committee: undefined },
          { time: "16:00", committee: "fagkom" },
          { time: "17:00", committee: "fagkom" },
          { time: "18:00", committee: undefined }
        ]
      }
    ]
  }
];

const currentCommittee = "appkom";

export const RoomBookingCalendar = () => {
  const [ roomTimes, setRoomTimes ] = useState<RoomTime[]>(initialRoomTimes);


  return (
    <div className="p-4">
      <div className="flex gap-10 justify-center my-10">
        <AvailabilityIndicator colorClass="" text="Ledig"/>
        <AvailabilityIndicator colorClass="bg-red-300" text="Valgt av en annen komité" />
        <AvailabilityIndicator colorClass="bg-green-300" text="Valgt av din komité" />
      </div>

      <div className="flex mb-4">
        <div className="w-20 font-bold">Dato</div>
        <div className="w-20 font-bold">Rom</div>
        {roomTimes[0].rooms[0].times.map((time, index) => (
          <div key={index} className="w-14 text-center font-semibold">{time.time}</div>
        ))}
      </div>

      <div className="mb-4">
        {
          roomTimes.map((roomTime, index) => (
            <div key={index} className="mb-4">
              {
                roomTime.rooms.map((room, index) => (
                  <div key={index} className="flex">
                    <div className="w-20">{index === 0 && roomTime.date}</div>
                    <div className="w-20">{room.room}</div>
                    {
                      room.times.map((time, index) => (
                        <Cell key={index} committee={time.committee} />
                      ))
                    }
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  );
}

const Cell = ({committee}: {committee: string | undefined }) => {
  const colorClass = committee === undefined ? "" : committee === currentCommittee ? "bg-green-300" : "bg-red-300";
  const cursorHoverClass = committee === undefined ||  committee === currentCommittee ? "cursor-pointer hover:bg-gray-100" : "";

  return (
    <div
      className={clsx(
        "w-14 h-8 border border-gray-300 text-[12px] flex justify-center items-center overflow-hidden transition",
        colorClass,
        cursorHoverClass,
      )}
      title={committee}
    >
      {committee}
    </div>
  );
}

const AvailabilityIndicator = ({ colorClass, text }: { colorClass: string, text: string }) => {
  return (
    <div className="flex items-center gap-2 text-gray-700 dark:text-white">
      <div
        className={clsx("w-16 h-8 border border-gray-300 rounded-sm dark:border-gray-700", colorClass)}
      />
      <div>
        {text}
      </div>
    </div>
  );
};
