import '@testing-library/jest-dom';

global.chrome = {
    storage: {
        local: {
            get: jest.fn((keys, callback) => {
                const data = { tasks: [] }; // Replace with mock data if needed
                callback(data);
            }),
            set: jest.fn((data, callback) => {
                callback && callback();
            }),
        },
    },
};