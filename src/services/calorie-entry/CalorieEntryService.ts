import { ERROR_RESPONSES, GOOGLE_EVENT_CALORIES_KEY } from '../../constants';
import { ICalorieEntry, ICalorieEntryDTO } from './interfaces';

import { ApiEndpoint } from '../caching/interfaces';
import { Datastore } from '@google-cloud/datastore';
import { ICachingService } from '../caching/ICachingService';
import { ICalorieEntryService } from './ICalorieEntryService';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { typeCheckCaloriesAndFilterInvalid } from './constants';

export class CalorieEntryService implements ICalorieEntryService {
  private cache: ICachingService;
  private datastore: Datastore;

  public constructor(cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }

  public fetchCalories = async (): Promise<ICalorieEntry[]> => {
    const cacheKey = ApiEndpoint.GET_CALORIE_ENTRIES;

    if (this.cache.canGetCache(cacheKey)) {
      return this.cache.get(cacheKey) as ICalorieEntry[];
    }

    const query = this.datastore.createQuery(GOOGLE_EVENT_CALORIES_KEY);
    const entries: RunQueryResponse = await query.run();

    const result: ICalorieEntry[] = typeCheckCaloriesAndFilterInvalid(
      entries[0],
    );

    this.cache.add(cacheKey, result);
    return result;
  };

  public saveCalories = async (calorie: ICalorieEntry) => {
    try {
      return await this.datastore.save(this.formatData(calorie));
    } catch (error) {
      console.error('Error in saving to datastore:', error);
      throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
    }
  };

  private formatData = (calorieEntry: ICalorieEntry): ICalorieEntryDTO => {
    return {
      key: this.datastore.key([GOOGLE_EVENT_CALORIES_KEY]),
      data: {
        ...calorieEntry,
      },
    };
  };
}
