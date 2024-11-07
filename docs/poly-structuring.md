# Poly-Structure!

Polypoint clever integration allows us to install methods - before, and after, an instance is created.

```js

class A {
    foo() { return 'foo' }
}

Polypoint.head.install(A)


a = new A
console.log(a.hello)
// undefined

Polypoint.head.mixin('A', {
    hello: {
        value:  'world'
    }
})


a = new A
console.log(a.hello)
// world

```


Let's define a basic inheritence chain:

```js

class A {
    foo() { return 'foo' }
}


class B extends A {
    bar() { return 'bar' }
}


class C extends B {
    baz() { return 'baz' }
}

// Install them to make them _detectable_
Polypoint.head.install(A)
Polypoint.head.install(B)
Polypoint.head.install(C)
```

We can use our classes as normal.

```js
c = new C()
c.foo() == 'foo'
```

At any point, we can define extra functionality:
```js

Polypoint.head.mixin('C', {
    one: {
        get() {
            return 'one'
        }
    }
})

// It's ready to go:
c = new C;
c.one == 'one'
c.two == undefined

```

As a fun trick, we can update class `B` with more functionality, and _existing_ `C` instances also receive the properties:

```js
Polypoint.head.mixin('B', {
    two: {
        get() {
            return 'two'
        }
    }
})

b = new B;
b.two == 'two'

// our 'c' instance (from above); inherits the method.
c.two == 'two'
```

Furthermore, any _installed_ class is a target, such as class `A`. All three classes we defined, will receive the new functionality, including the `c` instance.

```js
Polypoint.head.mixin('A', {
    three: {
        get() {
            return 'three'
        }
    }
})

(new A).three == 'three'
b.three == 'three'

// from above `c = new C`
c.three == 'three'
```

## Pre-mixin

We can target a class before it is used and generated, and only `head.install()` the target classes:

```js
// Create a mixin for a class, of which doesn't exist yet.
Polypoint.head.mixin('E', {
    four: {
        get() {
            return 'four'
        }
    }
})

// Build stuff
class D {
    foo() { return 'foo' }
}


class E extends D {
    bar() { return 'bar' }
}


// Install to make  _detectable_
Polypoint.head.install(E)        // D was never installed (which is fine)

e = new E
e.four == 'four'
```

## Fence Hopping Head Space

The _head_ contains useful functions to help load classes, and provides a convenient location to store things when we need to hop-the-fence:

```js

;(function(){

    Polypoint.head.mixin('E', {
        four: {
            get() {
                return 'four'
            }
        }
    })

    // Build stuff
    class D {
        foo() { return 'foo' }
    }

})();


// Let's create E _later_, in another scope.
setTimeout(function(){

    class E extends Polypoint.D {
        bar() { return 'bar' }
    }


    // Install to make  _detectable_
    Polypoint.head.install(E)

    runStuff()
}, 1000)


const runStuff() = function{
    e = new Polypoint.E
    e.four == 'four'
}

```