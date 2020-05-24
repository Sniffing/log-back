import { advanceTo, clear } from 'jest-date-mock';

import { ApiEndpoint } from './interfaces';
import { CachingService } from './CachingService';
import { ICachingService } from './ICachingService';
import { IText } from '../../interfaces';

let testCache: ICachingService;
let mockDate: jest.SpyInstance;

describe('Caching service', () => {
  beforeEach(() => {
    const HOURS_TO_LIVE = 1;
    testCache = new CachingService(HOURS_TO_LIVE);
  });

  afterEach(() => {
    clear();
  });

  it('Returns undefined for no value', () => {
    const result = testCache.get(ApiEndpoint.GET_KEYWORD_ENTRIES);

    expect(result).toBeUndefined();
  });

  it('Cannot get cache if the entry does not exist', () => {
    const ans = testCache.canGetCache(ApiEndpoint.GET_KEYWORD_ENTRIES);

    expect(ans).toBeFalsy();
  });

  it('Cannot get cache if the entry is out of date', () => {
    advanceTo(new Date(2000, 5, 14, 0, 0, 0));

    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    testCache.add(key, 'test');

    clear();

    expect(testCache.isCacheExpired(key)).toBeTruthy();
    expect(testCache.canGetCache(key)).toBeFalsy();
  });

  it('Overwrites the cache if entry already exists', () => {
    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    const testEntry: IText = {
      data: 'test',
    };
    testCache.add(key, testEntry);
    expect(testCache.get(key)).toEqual(testEntry);

    const newEntry: IText = {
      data: 'newEntry',
    };
    testCache.add(key, newEntry);
    expect(testCache.get(key)).toEqual(newEntry);
  });

  it('Clears cache', () => {
    testCache.add(ApiEndpoint.GET_TEXT_ENTRIES, 'test');
    expect(testCache.size()).toBeGreaterThan(0);

    testCache.reset();
    expect(testCache.size()).toEqual(0);
  });

  it('Shows time within TTL and in same day is valid', () => {
    advanceTo(new Date(2000, 1, 1, 0, 0, 0));

    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    testCache.add(key, 'test');
    advanceTo(new Date(2000, 1, 1, 0, 30, 0));

    expect(testCache.canGetCache(key)).toBeTruthy();
  });

  it('Shows time past TTL and in same day is invalid', () => {
    advanceTo(new Date(2000, 1, 1, 0, 0, 0));

    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    testCache.add(key, 'test');

    advanceTo(new Date(2000, 1, 1, 12, 0, 0));

    expect(testCache.canGetCache(key)).toBeFalsy();
  });

  it('Shows time past TTL and in different day is invalid', () => {
    advanceTo(new Date(2000, 1, 1, 5, 0, 0));

    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    testCache.add(key, 'test');

    advanceTo(new Date(2000, 1, 2, 5, 30, 0));

    expect(testCache.canGetCache(key)).toBeFalsy();
  });

  it('Shows cached time in the future as invalid', () => {
    advanceTo(new Date(2900, 5, 1, 0, 0, 0));
    const key = ApiEndpoint.GET_TEXT_ENTRIES;
    testCache.add(key, 'test');

    clear();

    expect(testCache.canGetCache(key)).toBeFalsy();
  });
});
