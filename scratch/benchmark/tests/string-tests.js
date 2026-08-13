// String Building Benchmark Tests

suite.group('Simple Concatenation');

suite.addTest('+ operator', () => {
    let str = '';
    for (let i = 0; i < 50; i++) {
        str = str + 'test';
    }
});

suite.addTest('Template literals', () => {
    let str = '';
    for (let i = 0; i < 50; i++) {
        str = `${str}test`;
    }
});

suite.addTest('concat method', () => {
    let str = '';
    for (let i = 0; i < 50; i++) {
        str = str.concat('test');
    }
});

suite.group('Array Join');

suite.addTest('Array join', () => {
    const parts = [];
    for (let i = 0; i < 50; i++) {
        parts.push('test');
    }
    const str = parts.join('');
});

suite.addTest('Array join with separator', () => {
    const parts = [];
    for (let i = 0; i < 50; i++) {
        parts.push('test');
    }
    const str = parts.join('-');
});

suite.group('String Repetition');

suite.addTest('repeat method', () => {
    const str = 'test'.repeat(50);
});

suite.addTest('loop concatenation', () => {
    let str = '';
    for (let i = 0; i < 50; i++) {
        str += 'test';
    }
});

suite.group('Complex Building');

suite.addTest('Template literal interpolation', () => {
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += `Item ${i}: value=${i * 2}, `;
    }
});

suite.addTest('String builder pattern', () => {
    const parts = [];
    for (let i = 0; i < 20; i++) {
        parts.push('Item ');
        parts.push(i);
        parts.push(': value=');
        parts.push(i * 2);
        parts.push(', ');
    }
    const result = parts.join('');
});
