import { ICachingService } from "./ICachingService";
import { DataCache, ApiEndpoint, ICacheable } from "./interfaces";

export class CachingService implements ICachingService {
  private cache: Partial<DataCache>;
  private timeToLiveInHours: number;

  public constructor(timeToLiveinHours: number = 12) {
    this.cache = {};
    this.timeToLiveInHours = timeToLiveinHours;
  }

  public get = (endpoint: ApiEndpoint) => {
    return this.cache[endpoint]?.data;
  }

  public canGetCache = (endpoint: ApiEndpoint) => {
    return this.doesCacheExist(endpoint) && !this.isCacheExpired(endpoint);
  }

  public doesCacheExist = (endpoint: ApiEndpoint): boolean => {
    return this.cache.hasOwnProperty(endpoint);
  }

  public isCacheExpired = (endpoint: ApiEndpoint): boolean => {
    return !this.isValidCacheTime(this.cache[endpoint], new Date());
  }

  public add = (endpoint: ApiEndpoint, data: any) => {
    this.cache[endpoint] = {
      data,
      cacheTime: new Date(),
    };
  }

  public reset = () => {
    this.cache = {};
  }

  public size = () => { 
    return Object.keys(this.cache).length;
  }
  
  private isValidCacheTime = (cachedEntry: ICacheable, now: Date): boolean => {
    if (cachedEntry.cacheTime > now) {
      return false;
    }

    if (cachedEntry.cacheTime.getDay() !== now.getDay()) {
      return (now.getHours() + 24) - cachedEntry.cacheTime.getHours() < this.timeToLiveInHours;
    }

    const hourDiff = now.getHours() - cachedEntry.cacheTime.getHours();
    console.log("diff", hourDiff, now, cachedEntry.cacheTime);
    
    if (hourDiff < 0) {
      return (now.getHours() + 24) - cachedEntry.cacheTime.getHours() < this.timeToLiveInHours;
    } else {
      return hourDiff < this.timeToLiveInHours;
    }
  }
}