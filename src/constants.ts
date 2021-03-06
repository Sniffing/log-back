import {
  BooleanMetric,
  IBooleanMetrics,
  IKeyword,
  IKeywordDTO,
  ILogEntryData,
  ITextDTO,
  IWeightDTO,
  isTypeILogEntryData,
} from './interfaces';

import moment from 'moment';

export const GOOGLE_LOG_ENTRY_KEY = 'Log3';
export const GOOGLE_EVENT_ENTRY_KEY = 'Event';
export const GOOGLE_EVENT_CALORIES_KEY = 'Calories';

export const ERROR_RESPONSES = {
  STORE_DATA_DOES_NOT_MATCH_TYPES:
    'Data returned from the cloud store does not match expect type',
  COULD_NOT_FETCH_DATA: 'Could not fetch data from cloud',
  COULD_NOT_SAVE_DATA: 'Error saving data to the cloud',
  UNEXPECTED_ERROR_SEARCHING_KEY:
    'Unexpected error trying to verify if entry already exists',
  KEY_ALREADY_EXISTS: 'Saving for a date that already has an entry',
  INVALID_DATA: 'Invalid data sent in request body',
};

export const logEntryDataToWeightDTO = (entry: ILogEntryData): IWeightDTO => {
  return {
    date: entry.date,
    weight: entry.weight,
  };
};

export const logEntryDataToKeywordDTO = (entry: ILogEntryData): IKeywordDTO => {
  return {
    date: entry.date,
    keywords: entry.keywords,
  };
};

export const logEntryDataToTextDTO = (entry: ILogEntryData): ITextDTO => {
  return {
    date: entry.date,
    text: entry.text,
  };
};

export const typeCheckEntriesAndFilterInvalid = (
  entries: any[],
): ILogEntryData[] => {
  const typeMismatchedResults = new Set<string>();

  const validEntries = entries.filter((entry: any) => {
    const isCorrectType = isTypeILogEntryData(entry);
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

export const metricsToLowerCaseList = (
  jsonState: Partial<Record<BooleanMetric, boolean>>,
): string[] => {
  if (!jsonState) return [];

  return Object.entries(jsonState)
    .filter((state: [string, boolean]) => state[1])
    .map((state: [string, boolean]) => state[0].toLowerCase());
};

export const unixTimeToDate = (time: number) => {
  const date = moment(time).utc();
  const m = date.month() + 1;
  const month = m >= 10 ? m : '0' + m;
  return `${('0' + date.date()).slice(-2)}-${month}-${date.year()}`;
};

export const reverseDate = (date: string) => {
  let parts = date.split('-');
  return parts[2] + '-' + parts[1] + '-' + parts[0];
};

export const toDate = (yyyymmdd: string) => {
  const parts = yyyymmdd.split('-');
  const date = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
  );

  return date;
};

const lowerCaseAll = (things: string[]) => {
  return things.map((k) => k.toLowerCase());
};

export const mergeWordMetrics = (
  keywords: IKeyword,
  booleanMetrics: IBooleanMetrics,
) => {
  return lowerCaseAll(keywords.keywords).concat(
    metricsToLowerCaseList(booleanMetrics),
  );
};
