import { ICachingService } from "./ICachingService";
import { DataCache, ApiEndpoint, ICacheable } from "./interfaces";

export class CachingService implements ICachingService {
  private cache: Partial<DataCache>;
  private timeToLiveInHours: number;

  public constructor(timeToLiveinHours: number = 12) {
    this.cache = {};
    this.timeToLiveInHours = timeToLiveinHours;
  }

  public getDataIfInCache = (endpoint: ApiEndpoint): any | undefined =>  {
    if (this.cache.hasOwnProperty(endpoint) && this.isValidCacheTime(this.cache[endpoint])) {
      return this.cache[endpoint].data; 
    }
    return;
  }

  public entryExists = (endpoint: ApiEndpoint): boolean => {
    return this.cache.hasOwnProperty(endpoint);
  }

  public addToCache = (endpoint: ApiEndpoint, data: any) => {
    this.cache[endpoint] = {
      data,
      cacheTime: new Date(),
    };
  }

  public resetCache = () => {
    this.cache = {};
  }
  
  private isValidCacheTime = (cachedEntry: ICacheable): boolean => {
    const now = new Date();
    return (now.getHours() - cachedEntry.cacheTime.getHours()) < this.timeToLiveInHours;
  }
}