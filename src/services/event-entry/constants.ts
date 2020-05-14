import { ILifeEvent, isTypeILifeEvent } from './interfaces';

export const typeCheckEventsAndFilterInvalid = (
  entries: any[],
): ILifeEvent[] => {
  const typeMismatchedResults = new Set<string>();

  const validEntries = entries.filter((entry: any) => {
    const isCorrectType = isTypeILifeEvent(entry);
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
