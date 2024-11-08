# Poly-Structure!

Polypoint clever classy integration allows us to install properties before, and after, a class exists.

+ Define classes without the magic
+ Ready-to-go global object
+ Lazy install any property or method
+ Pre or late stage mixins

When building core libraries imports usually need to be imported before their required. But what if you didn't know you needed the import until _after_ you've created something?

+ Composition through injection in classic ES6.
+ Parallel modularity through late-stage inheritance.


## Installation

To get started, include the assets within your scope or page.

```jinja
<script src="../point_src/core/head.js" name=mylib></script>
```

This installs an object with a range of functions, conveniently using the `name=mylib` to define the global object name:

```js
window.mylib

// Tools available in `head`
window.mylib.head.mixin(...)
```

### Name

You can provide a name for the root global object through any of the following:


#### `name` Attribute

Apply the attribute `name=mylib`:

```jinja
<script src="../point_src/core/head.js" name='Polypoint'></script>
```

#### `data-name` Attribute

Or use the `data-name=mylib` property:

```jinja
<script src="../point_src/core/head.js" data-name='Polypoint'></script>
```

#### Filepath Hash Value

If that's not possible, the _hash_ at the end of the filepath `src=head.js#mylib` can define the name:

```jinja
<script src="../point_src/core/head.js#Polypoint"></script>
```

#### Default _filename_

If non of those exist, the name of the imported file is used

```jinja
<!-- name is head.js -->
<script src="../point_src/core/head.js"></script>
```

## Getting Started

We use standard ES6 classes for our code:

```js
class Human {
    speak() { return 'meow' }
}
```

We can store this class in our named library (called `mylib` from above)

```js
mylib.head.install(Human)
```

And install functionality:

```js
/* our custom thing */
class Human {};

/* Some late stage mixin */
mylib.head.mixin('Human', {
    frogCount: {
        value: 2,
        writable: true,
        // enumerable: true,
        // configurable: true,
    },
    ownsFrog: {
        get() {
            return this.frogCount += 1
        }
    }
})

/* Install the class of interest. */
mylib.head.install(Human)
```

We use the `Human` as expected:

```js
h = new Human

console.log(h.ownsFrog) // 3
console.log(h.ownsFrog) // 4
console.log(h.ownsFrog) // 5
```

## Larger Example

Here we create a class called `A`, instantiate it (as `a`) - then install.

```js
class A {
    /* My Fancy class full of important busy ness work ness. */
    foo() { return 'foo' }
}


let a = new A
let a2 = new A

/* As expected. `hello` doesn't exist. */
console.log(a.hello)
console.log(a2.hello)
// undefined

/* Now we can set it up. */
Polypoint.head.install(A)

/* Install an addon after creation */
Polypoint.head.mixin('A', {
    hello: {
        value:  'world'
    }
})

/* Poof! The new property is available on the existing instance! */
console.log(a.hello)
console.log(a2.hello)
// world

/* And new stuff! */
let a3 = new A

console.log(a3.hello)
// world
```


### Inheritance Compliant

We can target a class within a chain of inheritance. All children of a class will receive the updates

```js
class A {};
class B extends A {};
class C extends B {};


Polypoint.head.installMany(A, B, C)
Polypoint.head.mixin('B', {
    one: {
        get() => 'flew'
    }
})

const c = new C()
console.log(c.one)
// 'flew'
```

### Larger Example

Let's define a basic inheritance chain:

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
Polypoint.head.installMany(A, B, C)
```

We can use our classes as expected:

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