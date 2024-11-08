Polypoint.head.mixin(Polypoint.B, {
    egg: {
        get() {
            return this
        }
    }
})


class A {

    foo() {
        return 'foo'
    }
}


class B extends A {

    bar() {
        return 'bar'
    }
}


class C extends B {

    baz() {
        return 'baz'
    }
}


Polypoint.head.install(A)
Polypoint.head.install(B)
Polypoint.head.install(C)


;c = new C;
console.log('egg', c.egg)
