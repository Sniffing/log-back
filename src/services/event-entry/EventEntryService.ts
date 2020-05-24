import { ERROR_RESPONSES, GOOGLE_EVENT_ENTRY_KEY } from '../../constants';
import {
  IEventEntrySearchParams,
  ILifeEvent,
  ILifeEventDTO,
} from './interfaces';

import { ApiEndpoint } from '../caching/interfaces';
import { Datastore } from '@google-cloud/datastore';
import { ICachingService } from '../caching/ICachingService';
import { IEventEntryService } from './IEventEntryService';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { typeCheckEventsAndFilterInvalid } from './constants';

export class EventEntryService implements IEventEntryService {
  private cache: ICachingService;
  private datastore: Datastore;

  public constructor(cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }

  public fetchEvents = async (
    params: IEventEntrySearchParams = {},
  ): Promise<ILifeEvent[]> => {
    const cacheKey = ApiEndpoint.GET_LIFE_EVENTS;
    if (this.cache.canGetCache(cacheKey)) {
      return this.cache.get(cacheKey) as ILifeEvent[];
    }

    const query = this.datastore.createQuery(GOOGLE_EVENT_ENTRY_KEY);
    const entries: RunQueryResponse = await query.run();

    const result: ILifeEvent[] = typeCheckEventsAndFilterInvalid(entries[0]);

    this.cache.add(cacheKey, result);
    return result;
  };

  public saveEvent = async (event: ILifeEvent) => {
    const dto = this.formatData(event);
    try {
      return await this.datastore.save(dto);
    } catch (error) {
      console.error('Error in saving to datastore:', error);
      throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
    }
  };

  private formatData = (event: ILifeEvent): ILifeEventDTO => {
    return {
      key: this.datastore.key([GOOGLE_EVENT_ENTRY_KEY]),
      data: {
        ...event,
      },
    };
  };
}
