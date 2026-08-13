// Array Operations Benchmark Tests

suite.group('Array Creation');

suite.addTest('Array Literal', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
});

suite.addTest('Array.from', () => {
    const arr = Array.from({ length: 10 }, (_, i) => i + 1);
});

suite.addTest('Array.of', () => {
    const arr = Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
});

suite.addTest('new Array + Fill', () => {
    const arr = new Array(10).fill(0).map((_, i) => i + 1);
});

suite.group('Array Modification');

suite.addTest('Push', () => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
        arr.push(i);
    }
});

suite.addTest('Spread Operator', () => {
    let arr = [];
    for (let i = 0; i < 100; i++) {
        arr = [...arr, i];
    }
});

suite.addTest('Concat', () => {
    let arr = [];
    for (let i = 0; i < 100; i++) {
        arr = arr.concat(i);
    }
});

suite.group('Array Iteration');

suite.addTest('for loop', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
});

suite.addTest('forEach', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    arr.forEach(v => sum += v);
});

suite.addTest('for...of', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (const v of arr) {
        sum += v;
    }
});

suite.addTest('reduce', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const sum = arr.reduce((acc, v) => acc + v, 0);
});
