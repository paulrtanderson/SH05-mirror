import * as searchEngineModule from '../../background/searchEngine';
import MiniSearch from 'minisearch';

// Mock MiniSearch completely
jest.mock('minisearch');

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve())
    }
  }
};

describe('Search Engine Tests', () => {
  let miniSearchMock;
  
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
    
    // Create a mock for MiniSearch instance with all needed methods
    miniSearchMock = {
      add: jest.fn(),
      replace: jest.fn(),
      has: jest.fn(() => false),
      search: jest.fn(() => []),
    };
    
    // Reset the internal MiniSearch instance to our mock
    searchEngineModule._resetMiniSearchForTests(miniSearchMock);
  });

  test('should index a page', () => {
    const request = {
      url: 'https://example.com/page',
      title: 'Example Page',
      content: 'This is an example page content'
    };
    
    console.log('Before call - miniSearchMock:', miniSearchMock);
    console.log('getMiniSearch returns:', searchEngineModule.getMiniSearch());
    
    // Call the function under test
    searchEngineModule.handleIndexPage(request);
    
    console.log('After call - add called:', miniSearchMock.add.mock.calls);
    
    // Verify it called the add method with correct parameters
    expect(miniSearchMock.add).toHaveBeenCalledWith({
      id: 'https://example.com/page',
      title: 'Example Page',
      content: 'This is an example page content'
    });
  });

  test('should get search suggestions', () => {
    const searchResults = [
      { id: 'https://example.com/page1', title: 'Example Page 1', score: 0.9 },
      { id: 'https://example.com/page2', title: 'Example Page 2', score: 0.7 }
    ];
    
    // Set up the mock to return our search results
    miniSearchMock.search.mockReturnValue(searchResults);
    
    // Call the function under test
    const suggestions = searchEngineModule.getSuggestions('example');
    
    // Verify results
    expect(suggestions.length).toBe(2);
    expect(suggestions[0].content).toBe('https://example.com/page1');
    expect(miniSearchMock.search).toHaveBeenCalledWith('example', { prefix: true, fuzzy: 0.2 });
  });
  
  test('should replace existing pages', () => {
    // Set up mock to say it has the page already
    miniSearchMock.has.mockReturnValue(true);
    
    const request = {
      url: 'https://example.com/page',
      title: 'Updated Example Page',
      content: 'This is updated content'
    };
    
    // Call the function under test
    searchEngineModule.handleIndexPage(request);
    
    // Should call replace instead of add
    expect(miniSearchMock.replace).toHaveBeenCalled();
    expect(miniSearchMock.add).not.toHaveBeenCalled();
  });
  
  test('should handle empty search results', () => {
    // Set up mock to return empty results
    miniSearchMock.search.mockReturnValue([]);
    
    // Call the function under test
    const suggestions = searchEngineModule.getSuggestions('nonexistent');
    
    // Should return a default suggestion
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].content).toBe('nonexistent');
    expect(suggestions[0].description).toContain('No indexed pages found');
  });
});