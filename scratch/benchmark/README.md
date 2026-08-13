# JavaScript Benchmark Suite

A browser-based benchmarking tool for comparing JavaScript function performance.

1. Open `index.html` in your browser
2. Select a test file from the dropdown
3. Click "Run Benchmarks"
4. View results with performance comparisons

## File Structure

```
benchmark/
├── index.html              # Main UI
├── benchmark-worker.js     # Web Worker for running tests
├── benchmark-files.js      # Test file registry
├── benchmark-tests.js      # Default test file
└── tests/                  # Additional test suites
    ├── array-tests.js
    ├── string-tests.js
    └── loop-tests.js
```

## Creating Test Files

### Basic Test

```javascript
suite.addTest('Test Name', () => {
    // Code to benchmark
});
```

### Using Groups

```javascript
suite.group('Group Name');

suite.addTest('Test 1', () => {
    // Code here
});

suite.addTest('Test 2', () => {
    // Code here
});
```

### With Setup/Teardown

```javascript
suite.addTest(
    'Test Name',
    (data) => {
        // Test code using data
    },
    () => {
        // Setup - runs once before timing
        return { /* data */ };
    },
    (data) => {
        // Teardown - runs once after timing
    }
);
```

## Adding New Test Files

1. Create your test file (e.g., `tests/my-tests.js`)
2. Edit `benchmark-files.js` and add:

```javascript
{
    id: 'my-tests',
    name: 'My Custom Tests',
    file: 'tests/my-tests.js',
    description: 'Description of what this tests'
}
```

3. Reload the page and select your new test file

## Results

Each result shows:
- **Operations**: Total number of test executions
- **Ops/Second**: Operations per second
- **Avg Time**: Average time per operation (ms)
- **Speed Factor**: How much faster vs. baseline (slowest in group)
- **Duration**: Actual test duration

The fastest test in each group gets a 🏆 trophy

## Tips

- Use 2-5 seconds for quick tests
- Use 10+ seconds for stable, accurate results
- Group related tests together for better comparisons
- The "Reload Tests" button refreshes test code without page reload

## Browser Compatibility

Requires a modern browser with Web Worker support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
