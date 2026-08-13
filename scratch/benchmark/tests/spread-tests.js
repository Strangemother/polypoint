// String Building Benchmark Tests

// suite.group('Simple Concatenation');


let args = [10, 20, {}, true, 'apples']
let func = function(a,b,c,d,e) {
    return a + b
}


suite.addTest('Spread arguments', () => {
    func(...args)
});


suite.addTest('Apply arguments', () => {
    func.apply(func, args)
});
