import { entity } from '@google-cloud/datastore/build/src/entity';

export interface ILogEntry {
  dateState: IDate;
  booleanMetricState?: IBooleanMetrics;
  entryMetricState: IEntryMetric;
  keywordsState: IKeyword;
  textState: IText;
}

export function isTypeILogEntry(obj: any): obj is ILogEntry {
  if (obj === null || obj === undefined) return false;
  const o = obj as ILogEntry;
  return (isTypeIDate(o.dateState) && o.entryMetricState && isTypeIKeyword(o.keywordsState) && isTypeIText(o.textState));
}

export interface ILogEntryDTO {
  key: entity.Key,
  data: ILogEntryData
}

export function isTypeILogEntryDTO(obj: any): obj is ILogEntryDTO {
  if (obj === null || obj === undefined) return false;

  const o = obj as ILogEntryDTO;
  if (o.key && o.data) {
    return isTypeILogEntryData(o);
  }

  return false;
}

export interface ILogEntryData {
  date: string,
  weight: string,
  keywords: string[],
  text: string,
}

export function isTypeILogEntryData(obj: any): obj is ILogEntryData {
  if (obj === null || obj === undefined) return false;
  
  const o = obj as ILogEntryData;
  return (!!o.date && !!o.weight && !!o.keywords && !!o.text);
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

interface IEntryDTO {
  date:string,
}

export interface IWeightDTO extends IEntryDTO {
  weight: number,
}

export interface IKeywordDTO extends IEntryDTO {
  keywords: string[],
}

export interface ITextDTO  extends IEntryDTO {
  text: string,
}

interface IDate {
  date: string;
}
export function isTypeIDate(obj: any): obj is IDate {
  if (obj === null || obj === undefined) return false;
  const o = obj as IDate;
  return !!o.date;
}

interface IKeyword {
  keywords: string[];
}
export function isTypeIKeyword(obj: any): obj is IKeyword {
  if (obj === null || obj === undefined) return false;
  const o = obj as IKeyword;
  return o.keywords && Array.isArray(o.keywords);
}

interface IText {
  data: string;
}
export function isTypeIText(obj: any): obj is IText {
  if (obj === null || obj === undefined) return false;
  const o = obj as IText;
  return !!o.data;
}

type IBooleanMetrics = Partial<Record<BooleanMetric, boolean>>;

interface IEntryMetric {
  weight?: string;
}