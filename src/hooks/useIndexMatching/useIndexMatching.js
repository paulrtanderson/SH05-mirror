import { useState, useEffect } from 'react';

const useIndexMatching = () => {
    const [sites, setSites] = useState([]);
    const [regexs, setRegexs] = useState([]);
    const [urls, setUrls] = useState([]);
    const [stringMatches, setStringMatches] = useState([]);

    useEffect(() => {
        // Load initial state from local storage
        chrome.storage.local.get(['sites', 'regexs', 'urls', 'stringMatches'], (result) => {
            if (result.sites) setSites(result.sites);
            if (result.regexs) setRegexs(result.regexs);
            if (result.urls) setUrls(result.urls);
            if (result.stringMatches) setStringMatches(result.stringMatches);
        });
    }, []);

    const saveStateToLocalStorage = (key, value) => {
        chrome.storage.local.set({ [key]: value });
    };

    const addSite = (site) => {
        const newSites = [...sites, site];
        setSites(newSites);
        saveStateToLocalStorage('sites', newSites);
    };

    const removeSite = (site) => {
        const newSites = sites.filter(s => s !== site);
        setSites(newSites);
        saveStateToLocalStorage('sites', newSites);
    };

    const updateSite = (oldSite, newSite) => {
        const newSites = sites.map(s => s === oldSite ? newSite : s);
        setSites(newSites);
        saveStateToLocalStorage('sites', newSites);
    };

    const addRegex = (regex) => {
        const newRegexs = [...regexs, regex];
        setRegexs(newRegexs);
        saveStateToLocalStorage('regexs', newRegexs);
    };

    const removeRegex = (regex) => {
        const newRegexs = regexs.filter(r => r !== regex);
        setRegexs(newRegexs);
        saveStateToLocalStorage('regexs', newRegexs);
    };

    const updateRegex = (oldRegex, newRegex) => {
        const newRegexs = regexs.map(r => r === oldRegex ? newRegex : r);
        setRegexs(newRegexs);
        saveStateToLocalStorage('regexs', newRegexs);
    };

    const addUrl = (url) => {
        const newUrls = [...urls, url];
        setUrls(newUrls);
        saveStateToLocalStorage('urls', newUrls);
    };

    const removeUrl = (url) => {
        const newUrls = urls.filter(u => u !== url);
        setUrls(newUrls);
        saveStateToLocalStorage('urls', newUrls);
    };

    const updateUrl = (oldUrl, newUrl) => {
        const newUrls = urls.map(u => u === oldUrl ? newUrl : u);
        setUrls(newUrls);
        saveStateToLocalStorage('urls', newUrls);
    };

    const addStringMatch = (stringMatch) => {
        const newStringMatches = [...stringMatches, stringMatch];
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('stringMatches', newStringMatches);
    };

    const removeStringMatch = (stringMatch) => {
        const newStringMatches = stringMatches.filter(sm => sm !== stringMatch);
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('stringMatches', newStringMatches);
    };

    const updateStringMatch = (oldStringMatch, newStringMatch) => {
        const newStringMatches = stringMatches.map(sm => sm === oldStringMatch ? newStringMatch : sm);
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('stringMatches', newStringMatches);
    };

    const checkMatch = (url) => {
        const siteMatch = sites.some(site => url.includes(site));
        const regexMatch = regexs.some(regex => new RegExp(regex).test(url));
        const urlMatch = urls.includes(url);
        const stringMatch = stringMatches.some(stringMatch => url.includes(stringMatch));

        return siteMatch || regexMatch || urlMatch || stringMatch;
    };

    return {
        sites,
        regexs,
        urls,
        stringMatches,
        addSite,
        removeSite,
        updateSite,
        addRegex,
        removeRegex,
        updateRegex,
        addUrl,
        removeUrl,
        updateUrl,
        addStringMatch,
        removeStringMatch,
        updateStringMatch,
        checkMatch
    };
};

export default useIndexMatching;