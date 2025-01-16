// 如果使用 npm 包，请先安装它们：
// npm install wink-bm25-text-search minisearch

import { BM25F } from 'wink-bm25-text-search'; // 从 npm 包中导入
import MiniSearch from 'minisearch'; // 从 npm 包中导入

const TITLE_BOOST = 3;
const MIN_SEARCH_TERM_LENGTH = 3;
const DEFAULT_WEIGHT = 0.2;
const BM25F_MIN_DOCS = 3;

let docs = [];
let engine;
let runningEngine;
let miniSearch;

// 创建 MiniSearch 引擎
function createMiniSearch(boostTitle = 3, fuzzy = 0.2, prefix = true) {
  return new MiniSearch({
    fields: ['title', 'body'], // 搜索字段
    storeFields: ['url', 'title'], // 存储字段
    searchOptions: {
      boost: { title: boostTitle }, // 标题加权
      fuzzy: fuzzy, // 模糊搜索
      prefix: prefix, // 前缀匹配
    },
  });
}

// 设置 BM25F 引擎
async function setupBM25F(titleWeight = 20, bodyWeight = 1) {
  engine = new BM25F();
  engine.defineConfig({ fldWeights: { title: titleWeight, body: bodyWeight } });

  if (docs.length >= BM25F_MIN_DOCS) {
    docs.forEach((doc, i) => engine.addDoc(doc, i + 1));
    runningEngine = _.cloneDeep(engine);
    runningEngine.consolidate();
  }
}

// 更新索引
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

// 搜索功能
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

// 测试搜索引擎配置
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

// 监听消息
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

// 处理 Omnibox 输入
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

// 初始化
async function initialize() {
  miniSearch = createMiniSearch(TITLE_BOOST, DEFAULT_WEIGHT, true);
  const result = await chrome.storage.local.get(['indexed']);
  const indexed = result.indexed || { corpus: [] };

  docs = indexed.corpus || [];
  miniSearch.addAll(docs);
  await setupBM25F(20, 1);
}

initialize().then(() => {
  console.log('Background script initialized.');
});
