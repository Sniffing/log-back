import { ApiEndpoint } from './interfaces';

export interface ICachingService {
  get: (endpoint: ApiEndpoint) => any;
  canGetCache: (endpoint: ApiEndpoint) => boolean;
  add: (endpoint: ApiEndpoint, data: any) => void;
  reset: () => void;
  doesCacheExist: (endpoint: ApiEndpoint) => boolean;
  isCacheExpired: (endpoint: ApiEndpoint) => boolean;
  size: () => number;
}