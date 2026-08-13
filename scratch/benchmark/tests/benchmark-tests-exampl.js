// Benchmark Test Functions
// Define your test functions here using suite.addTest(name, function, setup, teardown)

// Example 1: Array operations
suite.addTest('Array Push', () => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
        arr.push(i);
    }
});

suite.addTest('Array Spread', () => {
    let arr = [];
    for (let i = 0; i < 100; i++) {
        arr = [...arr, i];
    }
});

// Example 2: Object creation
suite.addTest('Object Literal', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
});

suite.addTest('Object Constructor', () => {
    const obj = new Object();
    obj.a = 1;
    obj.b = 2;
    obj.c = 3;
    obj.d = 4;
    obj.e = 5;
});

// Example 3: String operations
suite.addTest('String Concatenation', () => {
    let str = '';
    for (let i = 0; i < 10; i++) {
        str = str + 'test';
    }
});

suite.addTest('Template Literals', () => {
    let str = '';
    for (let i = 0; i < 10; i++) {
        str = `${str}test`;
    }
});

suite.addTest('Array Join', () => {
    const parts = [];
    for (let i = 0; i < 10; i++) {
        parts.push('test');
    }
    const str = parts.join('');
});

// Example 4: Loop comparison
suite.addTest('For Loop', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
});

suite.addTest('ForEach', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    arr.forEach(item => sum += item);
});

suite.addTest('For...of', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    let sum = 0;
    for (const item of arr) {
        sum += item;
    }
});

suite.addTest('Reduce', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const sum = arr.reduce((acc, item) => acc + item, 0);
});

// Example 5: Using setup and teardown
suite.addTest(
    'Map Lookup',
    (data) => {
        const value = data.map.get('key500');
    },
    () => {
        // Setup: Create a Map with 1000 entries
        const map = new Map();
        for (let i = 0; i < 1000; i++) {
            map.set(`key${i}`, i);
        }
        return { map };
    },
    (data) => {
        // Teardown: Clean up
        data.map.clear();
    }
);

suite.addTest(
    'Object Lookup',
    (data) => {
        const value = data.obj['key500'];
    },
    () => {
        // Setup: Create an object with 1000 properties
        const obj = {};
        for (let i = 0; i < 1000; i++) {
            obj[`key${i}`] = i;
        }
        return { obj };
    }
);

// Example 6: Math operations
suite.addTest('Math.sqrt', () => {
    for (let i = 0; i < 100; i++) {
        Math.sqrt(i);
    }
});

suite.addTest('Power (x ** 0.5)', () => {
    for (let i = 0; i < 100; i++) {
        i ** 0.5;
    }
});

// Example 7: Array methods
suite.addTest('Array Filter + Map', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = arr.filter(x => x % 2 === 0).map(x => x * 2);
});

suite.addTest('Array Single Loop', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] % 2 === 0) {
            result.push(arr[i] * 2);
        }
    }
});
