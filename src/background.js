import { BM25F } from './assets/wink-bm25-text-search.js';
import MiniSearch from './assets/minisearch.min.js';

const TITLE_BOOST = 3;
const MIN_SEARCH_TERM_LENGTH = 3;
const DEFAULT_WEIGHT = 0.2;
const BM25F_MIN_DOCS = 3;

let docs = [];
let engine;
let runningEngine;

function createMiniSearch(boostTitle = 3, fuzzy = 0.2, prefix = true) {
  return new MiniSearch({
    fields: ['title', 'body'],
    storeFields: ['url', 'title'],
    searchOptions: {
      boost: { title: boostTitle },
      fuzzy: fuzzy,
      prefix: prefix,
    },
  });
}

async function setupBM25F(titleWeight = 20, bodyWeight = 1) {
  engine = new BM25F();
  engine.defineConfig({ fldWeights: { title: titleWeight, body: bodyWeight } });

  if (docs.length >= BM25F_MIN_DOCS) {
    docs.forEach((doc, i) => engine.addDoc(doc, i + 1));
    runningEngine = _.cloneDeep(engine);
    runningEngine.consolidate();
  }
}

async function updateIndex(page) {
  const result = await chrome.storage.local.get(['indexed']);
  const indexed = result.indexed || { corpus: [] };

  if (!indexed.corpus.some((doc) => doc.url === page.url)) {
    indexed.corpus.push(page);
    docs.push(page);
    miniSearch.add(page);
    engine.addDoc(page, docs.length);

    if (docs.length >= BM25F_MIN_DOCS) {
      runningEngine = _.cloneDeep(engine);
      runningEngine.consolidate();
    }

    await chrome.storage.local.set({ indexed });
    console.log(`Page indexed: ${page.url}`);
  } else {
    console.log(`Page already indexed: ${page.url}`);
  }
}

function search(query) {
  let results = [];

  if (query.length >= MIN_SEARCH_TERM_LENGTH) {
    results = miniSearch.search(query).map((res) => ({
      url: res.url,
      title: res.title,
    }));
  }

  if (results.length === 0 && runningEngine) {
    results = runningEngine.search(query).map((res) => docs[res[0] - 1]);
  }

  return results.slice(0, 10);
}

async function experimentSearchEngines() {
  const miniSearchConfigs = [
    { boostTitle: 3, fuzzy: 0.2, prefix: true },
    { boostTitle: 5, fuzzy: 0.5, prefix: false },
    { boostTitle: 10, fuzzy: 0.1, prefix: true },
  ];

  const bm25fConfigs = [
    { titleWeight: 20, bodyWeight: 1 },
    { titleWeight: 50, bodyWeight: 5 },
    { titleWeight: 30, bodyWeight: 10 },
  ];

  const queries = ['example', 'search', 'dynamic'];

  for (const miniConfig of miniSearchConfigs) {
    const miniSearch = createMiniSearch(miniConfig.boostTitle, miniConfig.fuzzy, miniConfig.prefix);
    miniSearch.addAll(docs);

    console.log(`Testing MiniSearch with config:`, miniConfig);

    for (const bmConfig of bm25fConfigs) {
      await setupBM25F(bmConfig.titleWeight, bmConfig.bodyWeight);
      console.log(`Testing BM25F with config:`, bmConfig);

      queries.forEach((query) => {
        let results = miniSearch.search(query);

        if (results.length === 0 && runningEngine) {
          results = runningEngine.search(query).map((res) => docs[res[0] - 1]);
        }

        console.log(`Query "${query}" results:`, results);
      });
    }
  }
}

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === 'sendVisibleTextContent') {
    const page = {
      url: request.url,
      title: request.title,
      body: request.visibleTextContent,
    };
    console.log('Received content for indexing:', page.url);
    await updateIndex(page);
  } else if (request.action === 'runExperiment') {
    await experimentSearchEngines();
  } else {
    console.warn('Unknown action received:', request.action);
  }
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('Search triggered with input:', text);
  const results = search(text);
  const suggestions = results.map((res) => ({
    content: res.url,
    description: res.title,
  }));
  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('Opening tab for URL:', text);
  chrome.tabs.create({ url: text });
});

initialize().then(() => {
  console.log('Background script initialized.');
});
