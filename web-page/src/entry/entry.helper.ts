import { IEntryFormValues, EntryFormFieldsEnum, ILogEntry, BooleanMetric } from '.';
import moment from 'moment';

export const defaultFormValues: IEntryFormValues = {
  [EntryFormFieldsEnum.DATE]: moment(),
  [EntryFormFieldsEnum.SET_EMOTIONS]: [],
  [EntryFormFieldsEnum.FREE_EMOTIONS]: []
};

export const dateFormat = "DD-MM-YYYY";
export const booleanMetrics = ['happy', 'sad', 'sick', 'lonely', 'stressed', 'overate', 'dance', 'gym'];

export const convertLogEntryToFormValues = (logEntry?: ILogEntry): IEntryFormValues => {
  if (!logEntry) return defaultFormValues;

  const weight = logEntry.entryMetricState?.weight;

  return {
    [EntryFormFieldsEnum.DATE]: moment.utc(logEntry.dateState.date),
    [EntryFormFieldsEnum.SET_EMOTIONS]: logEntry.booleanMetricState
      ? Object.keys(logEntry.booleanMetricState)
      : [],
    [EntryFormFieldsEnum.FREE_EMOTIONS]: logEntry.keywordsState.keywords,
    ...(weight && { [EntryFormFieldsEnum.WEIGHT]: weight }),
    [EntryFormFieldsEnum.THOUGHTS]: logEntry.textState.data
  };
};

export const convertFormValuesToLogEntry = (
    values: IEntryFormValues
  ): ILogEntry => {
  // const booleanMetricState: Partial<Record<BooleanMetric, boolean>> = {};
  //something is removing my values along the way
  // console.log(values);
  // console.log(values.SET_EMOTIONS);
  // values.SET_EMOTIONS?.forEach((emotion: string) => {
  //   const metric: BooleanMetric = BooleanMetric[emotion as keyof typeof BooleanMetric];
  //   if (metric) {
  //     booleanMetricState[metric] = true;
  //   }
  // })

  return {
    dateState: {
      date: values.DATE.format(dateFormat)
    },
    // booleanMetricState,
     
    entryMetricState: {
      ...(values.WEIGHT && { weight: values.WEIGHT })
    },
    keywordsState: {
      keywords: values.FREE_EMOTIONS || []
    },
    textState: {
      data: values.THOUGHTS || ""
    }
  };
};
