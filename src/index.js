'use strict';

function fetchWithTimeout(url, config = {headers: {'Accept': 'application/json'}}, timeout = 30000) {

        return new Promise((resolve, reject) => {
            // the reject on the promise in the timeout callback won't have any effect, *unless*
            // the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
            // the whole outer Promise, and the promise from the fetch is dropped entirely.
            setTimeout(() => reject(new Error('Call to LGPN timed out')), timeout);
            fetch(url, config).then(resolve, reject);
        }).then(
            response=>{
                // check for ok status
                if (response.ok) {
                    return response.text().then((str) => {
                        // response is wrapped in a function so we need to trim it
                        const start = str.indexOf('{');
                        const end = str.lastIndexOf(');');
                        try {
                            const substr = str.substring(start, end);
                            return JSON.parse(substr);
                        } catch (e) {
                            throw new Error(`Something wrong with the call to LGPN, possibly a problem with the network or the server. HTTP error: ${e}`);            
                        }
                    })
                }
                // if status not ok, through an error
                throw new Error(`Something wrong with the call to LGPN, possibly a problem with the network or the server. HTTP error: ${response.status}`);
            }
        )
}

function getEntitySourceURI(queryString) {
    // Calls a cwrc proxy (https://lookup.services.cwrc.ca/lgpn2), so that we can make https calls from the browser.
    // The proxy in turn then calls http://clas-lgpn2.classics.ox.ac.uk/
    // The lgpn lookup doesn't seem to have an https endpoint
    return `https://lookup.services.cwrc.ca/lgpn2/cgi-bin/lgpn_search.cgi?name=${encodeURIComponent(queryString)};style=json`
}

function getPersonLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function getPlaceLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function callLGPN(url, queryString) {
    return fetchWithTimeout(url).then((parsedJSON)=>{
        return parsedJSON.persons.map(({id, name, place, notBefore, notAfter}) => {
            const description = `Place: ${place}<br/>Floruit: ${notBefore} to ${notAfter}`;
            return {
                id: id,
                name: name,
                repository: 'lgpn',
                uri: 'https://www.lgpn.ox.ac.uk/id/'+id,
                uriForDisplay: 'https://www.lgpn.ox.ac.uk/id/'+id,
                description: description
            }
        })
    })
}

function findPerson(queryString) {
    return callLGPN(getPersonLookupURI(queryString), queryString)
}

function findPlace(queryString) {
    return callLGPN(getPlaceLookupURI(queryString), queryString)
}

module.exports = {
    findPerson: findPerson,
    findPlace: findPlace,
    getPersonLookupURI: getPersonLookupURI,
    getPlaceLookupURI: getPlaceLookupURI
}
