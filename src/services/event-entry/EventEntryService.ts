import { IEventEntryService } from './IEventEntryService';
import { IEventEntrySearchParams, ILifeEvent } from './interfaces';
import { ICachingService } from '../caching/ICachingService';
import { Datastore } from '@google-cloud/datastore';
import { ApiEndpoint } from '../caching/interfaces';
import {  GOOGLE_EVENT_ENTRY_KEY } from '../../constants';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { typeCheckEventsAndFilterInvalid } from './constants';

export class EventEntryService implements IEventEntryService {
  private cache: ICachingService;
  private datastore: Datastore;

  public constructor (cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }
  
  public fetchEvents =  async (params: IEventEntrySearchParams = {}): Promise<ILifeEvent[]> => {
    const cacheKey = ApiEndpoint.GET_LIFE_EVENTS;
    if (this.cache.canGetCache(cacheKey)) {
      console.log("Using cached values for Life events");
      return this.cache.get(cacheKey) as ILifeEvent[];
    }

    const query = this.datastore.createQuery(GOOGLE_EVENT_ENTRY_KEY)
    const entries: RunQueryResponse = await query.run();

    const result: ILifeEvent[] = typeCheckEventsAndFilterInvalid(entries[0]);

    this.cache.add(cacheKey, result); 
    return result;
  }

  public saveEvent(event: ILifeEvent) {

  }
}