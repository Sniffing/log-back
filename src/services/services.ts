import { Datastore, Query, PathType } from '@google-cloud/datastore';
import { CachingService } from './caching/CachingService';
import { LogEntryService } from './log-entry/LogEntryService';
import { EventEntryService } from './event-entry/EventEntryService';
import { entity } from '@google-cloud/datastore/build/src/entity';
import { CalorieEntryService } from './calorie-entry/CalorieEntryService';

export class Services {

  private datastore: Datastore;
  private cache: CachingService;

  private _logEntryService: LogEntryService;
  private _eventEntryService: EventEntryService;
  private _calorieEntryService: CalorieEntryService;

  public constructor(appId: string) {
  	this.datastore = new Datastore({
  		projectId: appId
  	});
  	this.cache = new CachingService();


  	this._logEntryService = new LogEntryService(this.cache, this.datastore);
  	this._eventEntryService = new EventEntryService(this.cache, this.datastore);
  	this._calorieEntryService = new CalorieEntryService(this.cache, this.datastore);
  }

  public get logEntryService(): LogEntryService {
  	return this._logEntryService;
  }

  public get eventEntryService(): EventEntryService {
  	return this._eventEntryService;
  }

  public get calorieEntryService(): CalorieEntryService {
  	return this._calorieEntryService;
  }

  public resetCache(): void {
  	this.cache.reset();
  }

  public query(key: string): Query {
  	return this.datastore.createQuery(key);
  }

  public createKeyFromString(keyOptions: string) {
  	return this.datastore.key(keyOptions);
  }

  public createKeyFromArray(keyOptions: PathType[]) {
  	return this.datastore.key(keyOptions);
  }

  public createKeyFromOptions(keyOptions: entity.KeyOptions) {
  	return this.datastore.key(keyOptions);
  }
}