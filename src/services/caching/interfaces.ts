export enum ApiEndpoint {
  GET_LOG_ENTRIES,
  GET_WEIGHT_ENTRIES,
  GET_TEXT_ENTRIES,
  GET_KEYWORD_ENTRIES,

  GET_ALL_ENTRIES,

  GET_LIFE_EVENTS,

  GET_CALORIE_ENTRIES,
}

export type DataCache = Record<ApiEndpoint, ICacheable>;
export interface ICacheable {
  data: any;
  cacheTime: Date;
}
