'use strict';

let lgpn = require('../src/index.js');

const fetchMock = require('fetch-mock');

const queryString = 'Αβα';
const queryStringWithNoResults = 'ldfjk';
const queryStringForTimeout = "chartrand";
const queryStringForError = "cuff";
const expectedResultLength = 5;
const emptyResultFixture = require('./httpResponseMocks/noResults.js');
const resultsFixture = require('./httpResponseMocks/results.js');

jest.useFakeTimers();

// setup server mocks for each type of call
[
    { uriBuilderFn: 'getPersonLookupURI', testFixture: resultsFixture },
    { uriBuilderFn: 'getPlaceLookupURI', testFixture: resultsFixture }
].forEach(entityLookup => {

    let uriBuilderFn = lgpn[entityLookup.uriBuilderFn];

    fetchMock.get(uriBuilderFn(queryString), entityLookup.testFixture);
    fetchMock.get(uriBuilderFn(queryStringWithNoResults), emptyResultFixture);
    fetchMock.get(uriBuilderFn(queryStringForTimeout), (url, opts) => {
        setTimeout(Promise.resolve, 8100);
    });
    fetchMock.get(uriBuilderFn(queryStringForError), 500);
})

// from https://stackoverflow.com/a/35047888
function doObjectsHaveSameKeys(...objects) {
    const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
    const union = new Set(allKeys);
    return objects.every(object => union.size === Object.keys(object).length);
}

test('lookup builders', () => {
    expect.assertions(2);
    ['getPersonLookupURI', 'getPlaceLookupURI'].forEach(uriBuilderMethod => {
        expect(lgpn[uriBuilderMethod](queryString).includes(encodeURIComponent(queryString))).toBe(true);
    });
});

['findPerson', 'findPlace'].forEach((nameOfLookupFn) => {
    test(nameOfLookupFn, async () => {
        expect.assertions(13);
        let lookupFn = lgpn[nameOfLookupFn];
        expect(typeof lookupFn).toBe('function');
        let results = await lookupFn(queryString);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeLessThanOrEqual(expectedResultLength);
        results.forEach(singleResult => {
            expect(doObjectsHaveSameKeys(singleResult, {
                id: '',
                uri: '',
                uriForDisplay: '',
                name: '',
                repository: '',
                description: ''
            })).toBe(true);
        })

        // with no results
        results = await lookupFn(queryStringWithNoResults);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);

        // with a server error
        let shouldBeNullResult = false;
        shouldBeNullResult = await lookupFn(queryStringForError).catch(error => {
            // an http error should reject the promise
            expect(true).toBe(true);
            return false;
        })
        // a falsey result should be returned
        expect(shouldBeNullResult).toBeFalsy();

        // when query times out
        try {
            await lookupFn(queryStringForTimeout);
        } catch (err) {
            // the promise should be rejected
            expect(true).toBe(true);
        }
    })
})
