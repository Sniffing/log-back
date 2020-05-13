import { entity } from '@google-cloud/datastore/build/src/entity';

export type nature = 'good' | 'bad';
export interface ICalorieEntry {
  date: number; //unix time
  calories: number;
}

export interface ICalorieEntryDTO {
  key: entity.Key,
  data: ICalorieEntry
}

export function isTypeICalorieEntry(obj: any): obj is ICalorieEntry {
	if (obj === null || obj === undefined) return false;
	const o = obj as ICalorieEntry;
	return !!o.calories && !!o.date;
}