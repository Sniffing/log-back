import {
  ERROR_RESPONSES,
  GOOGLE_EVENT_CALORIES_KEY,
  reverseDate,
  toDate,
  unixTimeToDate,
} from '../../constants';
import { ICalorieEntry, ICalorieEntryDTO } from './interfaces';

import { ApiEndpoint } from '../caching/interfaces';
import CsvReadableStream from 'csv-reader';
import { Datastore } from '@google-cloud/datastore';
import { ICachingService } from '../caching/ICachingService';
import { ICalorieEntryService } from './ICalorieEntryService';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
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

  public uploadCaloriesFromCSV = async (csv: UploadedFile) => {
    const path = csv.tempFilePath;
    let inputStream = fs.createReadStream(path, 'utf8');

    const data: ICalorieEntry[] = [];

    inputStream
      .pipe(
        new CsvReadableStream({
          parseNumbers: true,
          parseBooleans: true,
          trim: true,
        }),
      )
      .on('data', (val: any[]) => {
        const key = val[0];
        const calories = val[1];
        //TODO: standaradise milliseconds vs seconds across the app
        const unixTime = toDate(key).getTime() / 1000;
        data.push({
          date: unixTime,
          calories,
        });
      })
      .on('end', async () => {
        await Promise.all(data.map(this.uploadCalories));
        fs.unlink(path, (err) => {
          if (err) {
            console.error('COULD NOT DELETE', path);
          }
        });
        console.log(`Uploaded ${data.length} entries through CSV`);
      });
  };

  private uploadCalories = async (entry: ICalorieEntry) => {
    return this.saveCalories(entry);
  };

  private formatData = (calorieEntry: ICalorieEntry): ICalorieEntryDTO => {
    const stringDate = reverseDate(unixTimeToDate(calorieEntry.date * 1000));
    return {
      key: this.datastore.key([GOOGLE_EVENT_CALORIES_KEY, stringDate]),
      data: {
        ...calorieEntry,
      },
    };
  };
}
