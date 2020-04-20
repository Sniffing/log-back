import { ICachingService } from "../caching/ICachingService";
import { ILogEntryService } from "./ILogEntryService";
import { IWeightDTO, IKeywordDTO, ITextDTO, ILogEntryDTO, ILogEntry } from "../../interfaces";
import { Datastore } from "@google-cloud/datastore";
import { GOOGLE_KIND_KEY, typeCheckEntriesAndFilterInvalid, logEntryDataToKeywordDTO, logEntryDataToWeightDTO, logEntryDataToTextDTO, ERROR_RESPONSES, reverseDate, mergeWordMetrics } from "../../constants";
import { RunQueryResponse } from "@google-cloud/datastore/build/src/query";
import { ApiEndpoint } from "../caching/interfaces";

export class LogEntryService implements ILogEntryService {

  private cache: ICachingService;
  private datastore: Datastore;

  public constructor (cache: ICachingService, datastore: Datastore) {
    this.cache = cache;
    this.datastore = datastore;
  }
  
  public saveEntry = async (data: ILogEntryDTO) => {
    let existingEntry;
    try {
      existingEntry = await this.datastore.get(data.key);
    } catch (error) {
      throw new Error(ERROR_RESPONSES.UNEXPECTED_ERROR_SEARCHING_KEY);
    }
  
    if (existingEntry.length < 1 || (existingEntry.length === 1 && existingEntry[0] == undefined)) {
      try {
        await this.saveToCloud(data);
      } catch (error) {
        throw error;
      }
    } else {
      console.error("Entry already exists for date:", data.key.name);
      throw new Error(ERROR_RESPONSES.KEY_ALREADY_EXISTS);
    }
  }
  
  public getWeight = async (): Promise<IWeightDTO[]> => {
    const cachedData = this.cache.getDataIfInCache(ApiEndpoint.GET_WEIGHT_ENTRIES);
    if (cachedData !== undefined) {
      console.log("Using cached values for weight");
      return Promise.resolve(cachedData as IWeightDTO[]);
    }

    try {
      const query = this.datastore.createQuery(GOOGLE_KIND_KEY)
                         .filter('weight', ">", "0");
      const entries: RunQueryResponse = await query.run();
      const result: IWeightDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
        .map(logEntryDataToWeightDTO);

      this.cache.addToCache(ApiEndpoint.GET_WEIGHT_ENTRIES, result); 
      return result;
    } catch (error) {
      throw error;
    }
  }

  public getKeywords = async (): Promise<IKeywordDTO[]> => {
    const cachedData = this.cache.getDataIfInCache(ApiEndpoint.GET_KEYWORD_ENTRIES);
    if (cachedData !== undefined) {
      console.log("Using cached values for keywords");
      return Promise.resolve(cachedData as IKeywordDTO[]);
    }

    try {
      const query = this.datastore.createQuery(GOOGLE_KIND_KEY);
      const entries: RunQueryResponse = await query.run()
      let result: IKeywordDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
        .map(logEntryDataToKeywordDTO);
      
      this.cache.addToCache(ApiEndpoint.GET_KEYWORD_ENTRIES, result);
      return result;
    } catch (error) {
      throw error;
    }   
  }

  public getText = async (): Promise<ITextDTO[]> => {
    const cachedData = this.cache.getDataIfInCache(ApiEndpoint.GET_TEXT_ENTRIES);
    if (cachedData !== undefined) {
      console.log("Using cached values for text");
      return Promise.resolve(cachedData as ITextDTO[]);
    }
    
    try {
      const query = this.datastore.createQuery(GOOGLE_KIND_KEY);
      const entries: RunQueryResponse = await query.run();
      const result: ITextDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
        .map(logEntryDataToTextDTO);

      this.cache.addToCache(ApiEndpoint.GET_TEXT_ENTRIES, result); 
      return result;
    } catch(error) {
      throw error;
    }
  }

  private saveToCloud = async (data: ILogEntryDTO) => {
    try {
      await this.datastore.save(data);
    } catch (error) {
      throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
    }
  }
}