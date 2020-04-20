import { ApiEndpoint, ICacheable } from "./interfaces";

export interface ICachingService {
  getDataIfInCache: (endpoint: ApiEndpoint) => any | undefined;
  addToCache: (endpoint: ApiEndpoint, data: any) => void;
  resetCache: () => void;
  entryExists: (endpoint: ApiEndpoint) => boolean;
}