// Benchmark Test Functions
// Define your test functions here using suite.addTest(name, function, setup, teardown)
// Use suite.group('Group Name') to organize tests into groups

// Property Access Group - "gets"
suite.group('gets');

suite.addTest('get prop', () => {
    class Test {
        get prop() {
            return 42;
        }
    }
    const obj = new Test();
    const res = obj.prop + 42;
});


suite.addTest('method prop()', () => {
    class Test {
        prop() {
            return 42;
        }
    }
    const obj = new Test();
    const res = obj.prop() + 42;
});


suite.addTest('direct prop', () => {
    class Test {
        constructor() {
            this.prop = 42;
        }
    }
    const obj = new Test();
    const res = obj.prop + 42;
});


// Method Calls Group - "sets"
suite.group('sets');

suite.addTest('method setProp()', () => {
    class Test {
        setProp(v) {
            return this.value = v;
        }
        prop() {
            this.value;
        }
    }
    const obj = new Test();
    const res = obj.setProp(42)  + 42
});

suite.addTest('set prop', () => {
    class Test {
        #value = 0;
        set prop(val) {
            this.#value = val;
        }
        get prop() {
            return this.#value;
        }
    }
    const obj = new Test();
    obj.prop = 42;
    const res = obj.prop + 42;
});

