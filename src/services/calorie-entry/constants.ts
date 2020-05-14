import { ICalorieEntry, isTypeICalorieEntry } from './interfaces';

export const typeCheckCaloriesAndFilterInvalid = (
  entries: any[],
): ICalorieEntry[] => {
  const typeMismatchedResults = new Set<string>();

  const validEntries = entries.filter((entry: any) => {
    const isCorrectType = isTypeICalorieEntry(entry);
    if (!isCorrectType) {
      typeMismatchedResults.add(entry.date);
    }
    return isCorrectType;
  });

  if (typeMismatchedResults.size > 0) {
    console.error(
      `There were ${typeMismatchedResults.size} invalid results from query:`,
      typeMismatchedResults,
    );
  }

  return validEntries;
};
