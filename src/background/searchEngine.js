import MiniSearch from "minisearch";
import { encode } from "he";
import { removeAnchorLink, removeDuplicates } from "./text-utils.js";

const INDEX_DESCRIPTOR = {
  fields: ["title", "content"], // Fields to index
  storeFields: ["title"], // Fields to return in search results
  idField: "id", // Field for unique identifier
  searchOptions: {
    boost: { title: 2 }, // Give higher weight to title matches
    fuzzy: 0.2, // Allow slight spelling variations
  },
};

let miniSearch = new MiniSearch(INDEX_DESCRIPTOR);

const SCORE_THRESHOLD = 0.5;
/**
 * Get search suggestions based on input text
 */
export function getSuggestions(text) {
  let results = miniSearch.search(text, { prefix: true, fuzzy: 0.2 });
  let filteredResults = results.filter((result) => result.score > SCORE_THRESHOLD).slice(0, 10);
  removeDuplicates(filteredResults);
  
  let suggestions = filteredResults.map((result) => ({
    content: result.id,
    description: encode(result.title),
  }));

  if (suggestions.length === 0) {
    suggestions.push({
      content: text,
      description: `No indexed pages found for "${text}"`,
    });
  }
  return suggestions;
}

/**
 * Index a page in the search engine
 */
export function handleIndexPage(request) {
  console.log("Indexing page:", request.url);

  let pageData = {
    id: removeAnchorLink(request.url),
    title: request.title,
    content: request.content,
  };

  if (miniSearch.has(pageData.id)) {
    miniSearch.replace(pageData);
  } else {
    miniSearch.add(pageData);
  }
}

/**
 * Save search index to storage
 */
export async function saveMinisearch() {
  await chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) });
}

/**
 * Load search index from storage
 */
export async function loadSearchIndex() {
  const data = await chrome.storage.local.get("pageIndex");
  if (data.pageIndex) {
    miniSearch = MiniSearch.loadJSON(data.pageIndex, INDEX_DESCRIPTOR);
  }
}

/**
 * Get the MiniSearch instance
 */
export function getMiniSearch() {
  return miniSearch;
}

// Add at the end of the file
export function _resetMiniSearchForTests(mockInstance) {
  miniSearch = mockInstance;
}