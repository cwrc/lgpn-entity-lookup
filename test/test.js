import fetchMock from 'fetch-mock';
import lgpn from '../src/index.js';

fetchMock.config.overwriteRoutes = false;

const emptyResultFixture = require('./httpResponseMocks/noResults.js');
const resultsFixture = require('./httpResponseMocks/results.js');

const queryString = 'Αβα';
const queryStringWithNoResults = 'ldfjk';
const queryStringForTimeout = 'chartrand';
const queryStringForError = 'cuff';
const expectedResultLength = 5;

jest.useFakeTimers();

// setup server mocks for each type of call
[
  { uriBuilderFn: 'getPersonLookupURI', testFixture: resultsFixture },
  { uriBuilderFn: 'getPlaceLookupURI', testFixture: resultsFixture },
].forEach((entityLookup) => {
  const uriBuilderFn = lgpn[entityLookup.uriBuilderFn];

  fetchMock.get(uriBuilderFn(queryString), entityLookup.testFixture);
  fetchMock.get(uriBuilderFn(queryStringWithNoResults), emptyResultFixture);
  fetchMock.get(uriBuilderFn(queryStringForTimeout), () => {
    setTimeout(Promise.resolve, 8100);
  });
  fetchMock.get(uriBuilderFn(queryStringForError), 500);
});

// from https://stackoverflow.com/a/35047888
const doObjectsHaveSameKeys = (...objects) => {
  const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
  const union = new Set(allKeys);
  return objects.every((object) => union.size === Object.keys(object).length);
};

test('lookup builders', () => {
  expect.assertions(2);
  ['getPersonLookupURI', 'getPlaceLookupURI'].forEach((uriBuilderMethod) => {
    expect(lgpn[uriBuilderMethod](queryString).includes(encodeURIComponent(queryString))).toBe(true);
  });
});

['findPerson', 'findPlace'].forEach((nameOfLookupFn) => {
  test(nameOfLookupFn, async () => {
    expect.assertions(7);

    const results = await lgpn[nameOfLookupFn](queryString);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(expectedResultLength);
    results.forEach((singleResult) => {
      expect(
        doObjectsHaveSameKeys(singleResult, {
          id: '',
          uri: '',
          uriForDisplay: '',
          name: '',
          repository: '',
          description: '',
        })
      ).toBe(true);
    });
  });

  test(`${nameOfLookupFn} - no results`, async () => {
    // with no results
    expect.assertions(2);

    const results = await lgpn[nameOfLookupFn](queryStringWithNoResults);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  test(`${nameOfLookupFn} - server error`, async () => {
    // with a server error
    expect.assertions(2);

    let shouldBeNullResult = false;
    shouldBeNullResult = await lgpn[nameOfLookupFn](queryStringForError).catch(() => {
      // an http error should reject the promise
      expect(true).toBe(true);
      return false;
    });
    // a falsey result should be returned
    expect(shouldBeNullResult).toBeFalsy();
  });

  test(`${nameOfLookupFn} - times out`, async () => {
    // when query times out
    expect.assertions(1);
    await lgpn[nameOfLookupFn](queryStringForTimeout).catch(() => {
      expect(true).toBe(true);
    });
  });
});
