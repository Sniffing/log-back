import { EntryFormFieldsEnum } from '.';
import { Moment } from 'moment';

export interface IEntryFormValues {
  [EntryFormFieldsEnum.DATE]: Moment;
  [EntryFormFieldsEnum.SET_EMOTIONS]: string[];
  [EntryFormFieldsEnum.FREE_EMOTIONS]?: string[];
  [EntryFormFieldsEnum.WEIGHT]?: string;
  [EntryFormFieldsEnum.THOUGHTS]?: string;
}

export interface ILogEntry {
  dateState: IDate;
  booleanMetricState?: IBooleanMetrics;
  entryMetricState: IEntryMetric;
  keywordsState: IKeyword;
  textState: IText;
}

export enum BooleanMetric {
  happy = 'happy',
  sad = 'sad',
  sick = 'sick',
  lonely = 'lonely',
  stress = 'stress',
  overate = 'overate',
  dance = 'dance',
  gym = 'gym',
}

export const booleanMetricKeys = new Set(Object.keys(BooleanMetric));

interface IDate {
  date: string;
}

interface IKeyword {
  keywords: string[];
}

interface IText {
  data: string;
}

type IBooleanMetrics = Partial<Record<BooleanMetric, boolean>>;

interface IEntryMetric {
  weight?: string;
}

export interface IFormProps {
  id?: string;
  name: string;
  label?: string | React.Component | JSX.Element;
  placeholder?: string;
  validator?: any;
  required?: boolean;
}