// Loop Performance Benchmark Tests

suite.group('Basic Loops');

suite.addTest('for (traditional)', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
});

suite.addTest('for (cached length)', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        sum += arr[i];
    }
});

suite.addTest('while loop', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    let i = 0;
    while (i < arr.length) {
        sum += arr[i];
        i++;
    }
});

suite.addTest('for...of', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (const item of arr) {
        sum += item;
    }
});

suite.group('Array Methods');

suite.addTest('forEach', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    arr.forEach(item => sum += item);
});

suite.addTest('map', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const doubled = arr.map(item => item * 2);
});

suite.addTest('reduce', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const sum = arr.reduce((acc, item) => acc + item, 0);
});

suite.addTest('filter', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const evens = arr.filter(item => item % 2 === 0);
});

suite.group('Chained Operations');

suite.addTest('filter + map', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = arr.filter(x => x % 2 === 0).map(x => x * 2);
});

suite.addTest('for loop equivalent', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] % 2 === 0) {
            result.push(arr[i] * 2);
        }
    }
});

suite.addTest('reduce (single pass)', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = arr.reduce((acc, x) => {
        if (x % 2 === 0) {
            acc.push(x * 2);
        }
        return acc;
    }, []);
});
