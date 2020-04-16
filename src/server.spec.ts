import { isTypeILogEntry, ILogEntry } from './interfaces';

describe("Test type guards", () => {
  describe("isLogEntry", () => {

    const objectMissingField: Partial<ILogEntry> = {
      dateState: { date: "test", },
      entryMetricState: { weight: '5', },
      textState: { data: 'test'},
    }

    const ILogEntryObject: ILogEntry = {
      dateState: { date: 'test', },
      entryMetricState: { weight: '66' },
      keywordsState: { keywords: ['a'], },
      textState: { data: 'test' },
    }

    const objectPlusMore = {
      extra: 'here',
      dateState: { date: 'test', },
      entryMetricState: { weight: '66' },
      keywordsState: { keywords: ['a'], },
      textState: { data: 'test' },
    }

    const objectAllFieldsWrongTypes = {
      dateState: { date: 66,},
      entryMetricState: { weight: '66' },
      keywordsState: { keywords: "hi", },
      textState: { data: 'test' },
    }

    const invalidArguments = {
      "number": 5,
      "null": null,
      "undefined": undefined,
      "object missing field" : objectMissingField,
      "object with all fields but wrong type": objectAllFieldsWrongTypes,
    }

    const validArguments = {
      "full object": ILogEntryObject,
      "full object + more": objectPlusMore,
    }

    Object.entries(invalidArguments).forEach(([test, arg]) => {
      it(`invalid argument '${test}'`, () => {
        expect(isTypeILogEntry(arg)).toBeFalsy();
      });
    });

    Object.entries(validArguments).forEach(([test, arg]) => {
      it(`invalid argument '${test}'`, () => {
        expect(isTypeILogEntry(arg)).toBeTruthy();
      });
    })
  });
});