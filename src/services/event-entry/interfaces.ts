export type nature = 'good' | 'bad';
export interface ILifeEvent {
  name: string;
  description?: string;
  date: string;
  nature?: nature;
  intensity: number; //should be max 10, minimum 1.
  //10 should be huge say hospitalised vs getting married
  //5 is medium such as switched jobs
  //1 is a minor struggle that would cause stress, e.g. moving house
}
export function isTypeILifeEvent(obj: any): obj is ILifeEvent {
  if (obj === null || obj === undefined) return false;
  const o = obj as ILifeEvent;
  return !!o.name && !!o.date;
}
export interface IEventEntrySearchParams {
  nature?: nature;
  fromDate?: string;
  toDate?: string;
  intensity?: number;
}