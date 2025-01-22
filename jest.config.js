module.exports = {
    testEnvironment: 'jsdom', // Simulate a browser environment
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Setup script for RTL matchers
    globals: {
        'NODE_ENV': 'test',
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    },
};