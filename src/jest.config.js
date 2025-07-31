/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.(js|jsx|mjs)$': 'babel-jest', // for ESM like axios
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(axios)/)', // force transform for ESM axios
    ],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};
