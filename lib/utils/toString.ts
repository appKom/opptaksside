export const changeDisplayName = (committee: string) => {
  const apiName = revertDisplayName(committee);
  return apiName === "Kjelleren" ? "Realfagskjelleren" : apiName;
};

/**
 * Changes committeeName back to the capitalization used in the API.
 *
 * @param committee
 */
export const revertDisplayName = (committee: string) => {
  // TODO: Don't do this reverse .toLowerCase(), but use the value given from the api along the whole path instead
  const capitalized = committee.charAt(0).toUpperCase() + committee.slice(1);
  return capitalized;
};

export function formatPhoneNumber(phoneNumber: string) {
  const countryCode = "(+" + phoneNumber.slice(0, 2) + ")";
  const restOfNumber = phoneNumber.slice(2);

  const formattedNumber = restOfNumber.replace(
    /(\d{3})(\d{2})(\d{3})/,
    "$1 $2 $3"
  );

  return `${countryCode} ${formattedNumber}`;
}
