import { ICalorieEntry } from './interfaces';

export interface ICalorieEntryService {
  fetchCalories: () => Promise<ICalorieEntry[]>;
  saveCalories: (event: ICalorieEntry) => void;
}
