import { ICachingService } from "../caching/ICachingService";
import { ILogEntryService } from "./ILogEntryService";
import { IWeightDTO, IKeywordDTO, ITextDTO, ILogEntryDTO } from "../../interfaces";
import { Datastore } from "@google-cloud/datastore";
import { GOOGLE_LOG_ENTRY_KEY, typeCheckEntriesAndFilterInvalid, logEntryDataToKeywordDTO, logEntryDataToWeightDTO, logEntryDataToTextDTO, ERROR_RESPONSES } from "../../constants";
import { RunQueryResponse } from "@google-cloud/datastore/build/src/query";
import { ApiEndpoint } from "../caching/interfaces";
import { entity } from '@google-cloud/datastore/build/src/entity';

export class LogEntryService implements ILogEntryService {

  private cache: ICachingService;
  private datastore: Datastore;

  public constructor (cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }
  
  public saveEntry = async (data: ILogEntryDTO) => {
    let existingEntry = await this.getEntryIfExists(data.key);
  
    const entryExists = existingEntry.length < 1 || existingEntry[0] == undefined;

    if (entryExists) {
      try {
        await this.datastore.save(data);
      } catch (error) {
        console.error("Error in saving to datastore:", error);
        throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
      }
    } else {
      console.error("Entry already exists for date:", data.key.name);
      throw new Error(ERROR_RESPONSES.KEY_ALREADY_EXISTS);
    }
  }

  private getEntryIfExists = async (key: entity.Key) => {
    try {
      return await this.datastore.get(key);
    } catch (error) {
      throw new Error(ERROR_RESPONSES.UNEXPECTED_ERROR_SEARCHING_KEY);
    }
  }

  public getWeight = async (): Promise<IWeightDTO[]> => {
    if (this.cache.canGetCache(ApiEndpoint.GET_WEIGHT_ENTRIES)) {
      console.log("Using cached values for weight");
      return this.cache.get(ApiEndpoint.GET_WEIGHT_ENTRIES) as IWeightDTO[];
    }

    const query = this.datastore.createQuery(GOOGLE_LOG_ENTRY_KEY)
                        .filter('weight', ">", "0");
    const entries: RunQueryResponse = await query.run();
    const result: IWeightDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToWeightDTO);

    this.cache.add(ApiEndpoint.GET_WEIGHT_ENTRIES, result); 
    return result;
  }

  public getKeywords = async (): Promise<IKeywordDTO[]> => {
    if (this.cache.canGetCache(ApiEndpoint.GET_KEYWORD_ENTRIES)) {
      console.log("Using cached values for keywords");
      return this.cache.get(ApiEndpoint.GET_KEYWORD_ENTRIES) as IKeywordDTO[];
    }

    const query = this.datastore.createQuery(GOOGLE_LOG_ENTRY_KEY);
    const entries: RunQueryResponse = await query.run();
    let result: IKeywordDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToKeywordDTO);
    
    this.cache.add(ApiEndpoint.GET_KEYWORD_ENTRIES, result);
    return result;
  }

  public getText = async (): Promise<ITextDTO[]> => {
    if (this.cache.canGetCache(ApiEndpoint.GET_TEXT_ENTRIES)) {
      console.log("Using cached values for text");
      return this.cache.get(ApiEndpoint.GET_TEXT_ENTRIES) as ITextDTO[];
    }
  
    const query = this.datastore.createQuery(GOOGLE_LOG_ENTRY_KEY);
    const entries: RunQueryResponse = await query.run();
    const result: ITextDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToTextDTO);

    this.cache.add(ApiEndpoint.GET_TEXT_ENTRIES, result); 
    return result;
  }
}