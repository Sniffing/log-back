import { IEventEntrySearchParams, ILifeEvent } from './interfaces';

export interface IEventEntryService {
  fetchEvents: (
    searchControl: IEventEntrySearchParams,
  ) => Promise<ILifeEvent[]>;
  saveEvent: (event: ILifeEvent) => void;
}
