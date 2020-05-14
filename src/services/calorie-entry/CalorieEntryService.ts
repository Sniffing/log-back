import { ICalorieEntryDTO, ICalorieEntry } from './interfaces';
import { ICachingService } from '../caching/ICachingService';
import { Datastore } from '@google-cloud/datastore';
import { ApiEndpoint } from '../caching/interfaces';
import { GOOGLE_EVENT_ENTRY_KEY, ERROR_RESPONSES, GOOGLE_EVENT_CALORIES_KEY } from '../../constants';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { typeCheckCaloriesAndFilterInvalid } from './constants';
import { ICalorieEntryService } from './ICalorieEntryService';

export class CalorieEntryService implements ICalorieEntryService {
  private cache: ICachingService;
  private datastore: Datastore;

  public constructor (cache: ICachingService, datastore: Datastore) {
  	this.cache = cache;
  	this.datastore = datastore;
  }
  
  public fetchCalories =  async (): Promise<ICalorieEntry[]> => {
  	const cacheKey = ApiEndpoint.GET_CALORIE_ENTRIES;
  	if (this.cache.canGetCache(cacheKey)) {
  		console.log('Using cached values for Life events');
  		return this.cache.get(cacheKey) as ICalorieEntry[];
  	}

  	const query = this.datastore.createQuery(GOOGLE_EVENT_CALORIES_KEY);
  	const entries: RunQueryResponse = await query.run();

  	const result: ICalorieEntry[] = typeCheckCaloriesAndFilterInvalid(entries[0]);

  	this.cache.add(cacheKey, result); 
  	return result;
  }

  public saveCalories = async (calorie: ICalorieEntry) => {
  	const dto = this.formatData(calorie);
  	try {
  		return await this.datastore.save(dto);
  	} catch (error) {
  		console.error('Error in saving to datastore:', error);
  		throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
  	}
  }

  private formatData = (calorie: ICalorieEntry): ICalorieEntryDTO => {
  	return {
  		key: this.datastore.key([GOOGLE_EVENT_CALORIES_KEY]),
  		data: {
  			...calorie
  		}
  	};
  }
}