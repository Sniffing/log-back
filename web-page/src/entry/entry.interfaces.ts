import { EntryFormFieldsEnum } from '.';
import { Moment } from 'moment';

export interface IEntryFormValues {
  [EntryFormFieldsEnum.DATE]: Moment;
  [EntryFormFieldsEnum.SET_EMOTIONS]?: string[];
  [EntryFormFieldsEnum.FREE_EMOTIONS]?: string[];
  [EntryFormFieldsEnum.WEIGHT]?: IEntryMetric;
  [EntryFormFieldsEnum.THOUGHTS]?: string;
}

export interface ILogEntry {
  dateState: IDate;
  booleanMetricState?: IBooleanMetrics;
  entryMetricState?: IEntryMetric;
  keywordsState: IKeyword;
  textState: IText;
}

interface IDate {
  date: Date;
}

interface IKeyword {
  keywords: string[];
}

interface IText {
  data: string;
}

interface IBooleanMetrics {
  happy?: boolean;
  sad?: boolean;
  sick?: boolean;
  lonely?: boolean;
  stress?: boolean;
  overate?: boolean;
  dance?: boolean;
  gym?: boolean;
}

interface IEntryMetric {
  weight?: number;
}

export interface IFormProps {
  id?: string;
  name: string;
  label?: string | React.Component | JSX.Element;
  placeholder?: string;
  validator?: any;
  required?: boolean;
}