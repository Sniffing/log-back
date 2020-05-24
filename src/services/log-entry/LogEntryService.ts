import { Datastore, Query } from '@google-cloud/datastore';
import {
  ERROR_RESPONSES,
  GOOGLE_LOG_ENTRY_KEY,
  logEntryDataToKeywordDTO,
  logEntryDataToTextDTO,
  logEntryDataToWeightDTO,
  mergeWordMetrics,
  reverseDate,
} from '../../constants';
import {
  IKeywordDTO,
  ILogEntry,
  ILogEntryDTO,
  ITextDTO,
  IWeightDTO,
} from '../../interfaces';

import { ApiEndpoint } from '../caching/interfaces';
import { ICachingService } from '../caching/ICachingService';
import { ILogEntryService } from './ILogEntryService';
import { entity } from '@google-cloud/datastore/build/src/entity';
import { queryAndFormat } from './constants';
import { services } from '../../server';

export class LogEntryService implements ILogEntryService {
  private cache: ICachingService;
  private datastore: Datastore;

  public constructor(cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }

  public saveEntry = async (entry: ILogEntry) => {
    const data: ILogEntryDTO = this.formatData(entry);
    let existingEntry = await this.getEntryIfExists(data.key);

    const entryExists =
      existingEntry.length < 1 || existingEntry[0] == undefined;

    if (entryExists) {
      try {
        await this.datastore.save(data);
      } catch (error) {
        console.error('Error in saving to datastore:', error);
        throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
      }
    } else {
      console.error('Entry already exists for date:', data.key.name);
      throw new Error(ERROR_RESPONSES.KEY_ALREADY_EXISTS);
    }
  };

  private getEntryIfExists = async (key: entity.Key) => {
    try {
      return await this.datastore.get(key);
    } catch (error) {
      throw new Error(ERROR_RESPONSES.UNEXPECTED_ERROR_SEARCHING_KEY);
    }
  };

  public getWeight = async (): Promise<IWeightDTO[]> => {
    return await this.getData<IWeightDTO>(
      this.defaultQuery().filter('weight', '>', '0'),
      ApiEndpoint.GET_WEIGHT_ENTRIES,
      logEntryDataToWeightDTO,
    );
  };

  public getKeywords = async (): Promise<IKeywordDTO[]> => {
    return await this.getData<IKeywordDTO>(
      this.defaultQuery(),
      ApiEndpoint.GET_KEYWORD_ENTRIES,
      logEntryDataToKeywordDTO,
    );
  };

  public getText = async (): Promise<ITextDTO[]> => {
    return await this.getData<ITextDTO>(
      this.defaultQuery(),
      ApiEndpoint.GET_TEXT_ENTRIES,
      logEntryDataToTextDTO,
    );
  };

  private async getData<T>(
    query: Query,
    endpoint: ApiEndpoint,
    transformFn: any,
  ): Promise<T[]> {
    if (this.cache.canGetCache(endpoint)) {
      return this.cache.get(endpoint) as T[];
    }

    const result = await queryAndFormat<T>(query, transformFn);
    this.cache.add(endpoint, result);
    return result;
  }

  private defaultQuery = () => {
    return this.datastore.createQuery(GOOGLE_LOG_ENTRY_KEY);
  };

  private formatData = (state: ILogEntry): ILogEntryDTO => {
    const date = reverseDate(state.dateState.date);
    const keywords = mergeWordMetrics(
      state.keywordsState,
      state.booleanMetricState,
    );

    return {
      key: services.createKeyFromArray([GOOGLE_LOG_ENTRY_KEY, date]),
      data: {
        date,
        weight: state.entryMetricState?.weight || '',
        keywords,
        text: state.textState.data,
      },
    };
  };
}
