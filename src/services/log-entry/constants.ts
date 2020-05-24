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
