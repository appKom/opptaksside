import { OwGroup } from "../lib/types/types";

interface CommitteeAboutCardProps {
  committee: OwGroup;
  hasPeriod: boolean;
  isInterviewing: boolean;
}

const CommitteeAboutCard = ({
  committee,
  hasPeriod,
  isInterviewing,
}: CommitteeAboutCardProps) => {
  return (
    <div>
      <img
        src={committee.imageUrl || "/Online_svart_o.svg"}
        alt={committee.name}
        className="w-16 h-16 p-1 mb-2 bg-white rounded-full md:w-24 md:h-24"
      />

      <div className="flex flex-col items-start gap-2 mb-1 md:flex-row md:items-center md:mb-0">
        <h3 className="text-xl font-bold dark:text-white">
          {committee.name}
          {committee.name !== committee.abbreviation &&
            `(${committee.abbreviation})`}
        </h3>
        {hasPeriod && (
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
            Har opptak!
          </span>
        )}
        {isInterviewing && !hasPeriod && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
            Intervjuer pågår
          </span>
        )}
      </div>
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        {committee.email}
      </p>
      <p className="text-gray-500 whitespace-pre-wrap dark:text-gray-400">
        {committee.description || "Ingen opptaksbeskrivelse"}
      </p>
    </div>
  );
};

export default CommitteeAboutCard;
