// Benchmark Test File Registry
// Add your test files here

const BENCHMARK_FILES = [
    {
        id: 'property-access',
        name: 'Property Access (gets vs sets)',
        file: 'tests/benchmark-tests.js',
        description: 'Compare getter, setter, and direct property access'
    },
    {
        id: 'spread-args',
        name: 'Spread arguments vs .apply',
        file: 'tests/spread-tests.js',
        description: 'Compare ...args vs .apply() '
    },
    {
        id: 'array-operations',
        name: 'Array Operations',
        file: 'tests/array-tests.js',
        description: 'Array manipulation methods comparison'
    },
    {
        id: 'string-building',
        name: 'String Building',
        file: 'tests/string-tests.js',
        description: 'Different string concatenation approaches'
    },
    {
        id: 'loop-performance',
        name: 'Loop Performance',
        file: 'tests/loop-tests.js',
        description: 'for, forEach, map, reduce comparisons'
    }
];

// Export for both main thread and worker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BENCHMARK_FILES;
}
