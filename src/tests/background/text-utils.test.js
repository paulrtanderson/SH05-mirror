import { removeAnchorLink, getWordsSet, jaccardSimilarityTexts, removeDuplicates } from '../../background/text-utils';

// Mock Chrome API (minimal version needed for this test)
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(() => Promise.resolve())
    }
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Text Utils Tests', () => {
  test('should remove anchor links from URLs', () => {
    expect(removeAnchorLink('https://example.com/page#section')).toBe('https://example.com/page');
    expect(removeAnchorLink('https://example.com/page')).toBe('https://example.com/page');
  });

  test('should extract unique words from a string', () => {
    const result = getWordsSet('Hello world hello');
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has('hello')).toBeTruthy();
    expect(result.has('world')).toBeTruthy();
    console.log(result)
  });

  test('should calculate Jaccard similarity between two texts', () => {
    const text1 = 'apple banana orange';
    const text2 = 'apple orange grape';
    const similarity = jaccardSimilarityTexts(text1, text2);
    expect(similarity).toBe(0.5); // 2 words in common / 4 unique words total
  });

  test('should calculate Jaccard similarity between two texts 2', () => {
    const text1 = 'JavaScript Tutorial for Beginners';
    const text2 = 'JavaScript Tutorials for Beginners';
    const similarity = jaccardSimilarityTexts(text1, text2);
    expect(similarity).toBe(0.6); // 2 words in common / 4 unique words total
  });

  test('should remove duplicate results based on title similarity', () => {
    const results = [
      { title: 'JavaScript Tutorial for Beginners', score: 0.9 },
      { title: 'JavaScript Tutorials for Beginners', score: 0.85 }, // Should be removed as duplicate
      { title: 'Python Programming Basics', score: 0.8 }
    ];
    
    removeDuplicates(results);
    expect(results.length).toBe(3);
    expect(results[0].title).toBe('JavaScript Tutorial for Beginners');
    expect(results[1].title).toBe('JavaScript Tutorials for Beginners');
    expect(results[2].title).toBe('Python Programming Basics');
  });
});