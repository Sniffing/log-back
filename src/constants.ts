import { ILogEntryData, IWeightDTO, IKeywordDTO, ITextDTO, isTypeILogEntryData, BooleanMetric, IKeyword, IBooleanMetrics } from './interfaces';

export const GOOGLE_KIND_KEY = 'Log3';

export const ERROR_RESPONSES = {
  STORE_DATA_DOES_NOT_MATCH_TYPES: 'Data returned from the cloud store does not match expect type',
  COULD_NOT_FETCH_DATA: 'Could not fetch data from cloud',
}

export const logEntryDataToWeightDTO = (entry: ILogEntryData): IWeightDTO => {
  return {
    date: entry.date, 
    weight: entry.weight
  }
}

export const logEntryDataToKeywordDTO = (entry: ILogEntryData): IKeywordDTO => {
  return {
    date: entry.date, 
    keywords: entry.keywords
  }
}

export const logEntryDataToTextDTO = (entry: ILogEntryData): ITextDTO => {
  return {
    date: entry.date, 
    text: entry.text
  }
}

export const typeCheckEntriesAndFilterInvalid = (entries: any[], ): ILogEntryData[] => {
  const typeMismatchedResults = new Set<string>();

  const validEntries = entries.filter((entry: any) => {
    const isCorrectType = isTypeILogEntryData(entry);
    if (!isCorrectType) {
      typeMismatchedResults.add(entry.date)
    }
    return isCorrectType;
  });

  if (typeMismatchedResults.size > 0) {
    console.error(`There were ${typeMismatchedResults.size} invalid results from query:`, typeMismatchedResults);
  }

  return validEntries;
}

export const metricsToLowerCaseList = (jsonState: Partial<Record<BooleanMetric, boolean>>): string[] => {
  return Object.entries(jsonState)
    .filter((state: [string, boolean]) => state[1])
    .map((state: [string, boolean]) => state[0].toLowerCase());
}

//Convert american date into correct date reversed for lexicographic ordering
export const reverseDate = (date: string) => {
  let parts = date.split("-");
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

const lowerCaseAll = (things: string[]) => {
  return things.map(k => k.toLowerCase())
}

export const mergeWordMetrics = (keywords: IKeyword, booleanMetrics: IBooleanMetrics) => {
  return lowerCaseAll(keywords.keywords).concat(metricsToLowerCaseList(booleanMetrics));
}