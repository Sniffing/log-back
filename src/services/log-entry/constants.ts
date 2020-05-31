import { ApiEndpoint } from '../caching/interfaces';
import { Query } from '@google-cloud/datastore';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { typeCheckEntriesAndFilterInvalid } from '../../constants';

export async function queryAndFormat<T>(
  query: Query,
  transformFn: any,
): Promise<T[]> {
  const entries: RunQueryResponse = await query.run();
  const result: T[] = typeCheckEntriesAndFilterInvalid(entries[0]).map(
    transformFn,
  );

  return result;
}

export const resolvedEndpoints: Partial<Record<ApiEndpoint, ApiEndpoint>> = {
  [ApiEndpoint.GET_KEYWORD_ENTRIES]: ApiEndpoint.GET_ALL_ENTRIES,
  [ApiEndpoint.GET_TEXT_ENTRIES]: ApiEndpoint.GET_ALL_ENTRIES,
};
