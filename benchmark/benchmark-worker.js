// Benchmark Worker - Runs tests without blocking the UI

// Benchmark Suite Core (Worker Version)
class BenchmarkSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentGroup = null;
    }

    group(groupName) {
        this.currentGroup = groupName;
        return this;
    }

    addTest(name, fn, setup = null, teardown = null) {
        this.tests.push({ 
            name, 
            fn, 
            setup, 
            teardown,
            group: this.currentGroup || 'Ungrouped'
        });
    }

    runTest(test, duration) {
        const durationMs = duration * 1000;
        let operations = 0;
        let totalTime = 0;
        let errors = 0;

        // Setup
        let setupData = null;
        if (test.setup) {
            try {
                setupData = test.setup();
            } catch (e) {
                console.error(`Setup failed for ${test.name}:`, e);
                return null;
            }
        }

        const startTime = performance.now();
        const endTime = startTime + durationMs;

        // Run test repeatedly until duration expires
        while (performance.now() < endTime) {
            const iterStart = performance.now();
            try {
                test.fn(setupData);
                operations++;
            } catch (e) {
                errors++;
                console.error(`Error in ${test.name}:`, e);
            }
            totalTime += performance.now() - iterStart;
        }

        const actualDuration = performance.now() - startTime;

        // Teardown
        if (test.teardown) {
            try {
                test.teardown(setupData);
            } catch (e) {
                console.error(`Teardown failed for ${test.name}:`, e);
            }
        }

        return {
            name: test.name,
            operations,
            duration: actualDuration / 1000,
            opsPerSecond: (operations / actualDuration) * 1000,
            avgTime: totalTime / operations,
            errors,
            group: test.group
        };
    }

    runAll(duration) {
        this.results = [];
        
        for (let i = 0; i < this.tests.length; i++) {
            // Send progress update
            self.postMessage({
                type: 'progress',
                current: i,
                total: this.tests.length,
                testName: this.tests[i].name
            });
            
            const result = this.runTest(this.tests[i], duration);
            if (result) {
                this.results.push(result);
            }
        }

        // Sort by group, then by ops/sec descending within each group
        this.results.sort((a, b) => {
            if (a.group !== b.group) {
                return a.group.localeCompare(b.group);
            }
            return b.opsPerSecond - a.opsPerSecond;
        });
        
        return this.results;
    }

    clear() {
        this.tests = [];
        this.results = [];
    }
}

// Global suite instance for the worker
const suite = new BenchmarkSuite();

// Listen for messages from main thread
self.addEventListener('message', (e) => {
    const { type, data } = e.data;
    
    switch (type) {
        case 'loadTests':
            // Load test code and execute it
            try {
                // Clear existing tests
                suite.tests = [];
                suite.results = [];
                suite.currentGroup = null;
                
                // Execute the test code
                eval(data.testCode);
                
                self.postMessage({
                    type: 'testsLoaded',
                    tests: suite.tests.map(t => ({ name: t.name, group: t.group }))
                });
            } catch (error) {
                self.postMessage({
                    type: 'error',
                    message: `Failed to load tests: ${error.message}`
                });
            }
            break;
            
        case 'runBenchmarks':
            try {
                const results = suite.runAll(data.duration);
                self.postMessage({
                    type: 'complete',
                    results: results
                });
            } catch (error) {
                self.postMessage({
                    type: 'error',
                    message: `Benchmark failed: ${error.message}`
                });
            }
            break;
            
        case 'getTests':
            self.postMessage({
                type: 'testsLoaded',
                tests: suite.tests.map(t => ({ name: t.name, group: t.group }))
            });
            break;
    }
});

// Signal that worker is ready
self.postMessage({ type: 'ready' });
