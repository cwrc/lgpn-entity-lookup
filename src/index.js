'use strict';

const fetchWithTimeout = async (url, config = {headers: {'Accept': 'application/json'}}, time = 30000) => {

    /*
        the reject on the promise in the timeout callback won't have any effect, *unless*
        the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
        the whole outer Promise, and the promise from the fetch is dropped entirely.
    */

    // Create a promise that rejects in <time> milliseconds
	const timeout = new Promise((resolve, reject) => {
		let id = setTimeout(() => {
			clearTimeout(id);
			reject('Call to LGPN timed out')
		}, time)
	})

  // Returns a race between our timeout and the passed in promise
	return Promise.race([
		fetch(url, config),
		timeout
	])

}

const getEntitySourceURI = (queryString) => {
    // Calls a cwrc proxy (https://lookup.services.cwrc.ca/lgpn2), so that we can make https calls from the browser.
    // The proxy in turn then calls http://clas-lgpn2.classics.ox.ac.uk/
    // The lgpn lookup doesn't seem to have an https endpoint
    return `https://lookup.services.cwrc.ca/lgpn2/cgi-bin/lgpn_search.cgi?name=${encodeURIComponent(queryString)};style=json`
}

const getPersonLookupURI = (queryString) => getEntitySourceURI(queryString);

const getPlaceLookupURI = (queryString) => getEntitySourceURI(queryString);

const callLGPN = async (url) => {

    const response = await fetchWithTimeout(url)
        .catch((error) => {
            return error;
        })

    //if status not ok, through an error
    if (!response.ok) throw new Error(`Something wrong with the call to LGPN, possibly a problem with the network or the server. HTTP error: ${response.status}`)
    
    const responseText = await response.text();

    //find the result object
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf(');');
    const substr = responseText.substring(start, end);

    const result = JSON.parse(substr);

    const mapResponse = result.persons.map(({id, name, place, notBefore, notAfter}) => {
        const description = `Place: ${place}<br/>Floruit: ${notBefore} to ${notAfter}`;
        return {
            id,
            name,
            repository: 'lgpn',
            uri: 'https://www.lgpn.ox.ac.uk/id/'+id,
            uriForDisplay: 'https://www.lgpn.ox.ac.uk/id/'+id,
            description
        }
    })

    return mapResponse; 
}

const findPerson = (queryString) => callLGPN(getPersonLookupURI(queryString));

const findPlace = (queryString) => callLGPN(getPlaceLookupURI(queryString));

export default {
    findPerson,
    findPlace,
    getPersonLookupURI,
    getPlaceLookupURI
}