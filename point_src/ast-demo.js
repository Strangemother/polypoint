/*
# _tree_ Demo Source File

This file presents a bunch of javascript for  _tree_ convert tool tes.t

It contains various constructs, including:

- Block comments
- Inline comments
- Class declarations

This comment is the first block comment in the file.

*/

    /* stackItem1 A Multiline
        block comment
        for stackItem1 */
const stackItem1 = 'foo' // stackItem1 inline comment for
    , stackItem2 = 'bar'
    , stackItem3 = true
    /* stackItem4 block comment for */
    , stackItem4 = 199
    // stackItem5 inline comment for
    , stackItem5 = undefined
    ;


/* Generic function with no arguments, stored within a const. */
const constStoreFunction = function(){
    /* Generic function with no arguments, stored within a const. */
            this.clear(ctx)
        let a = this.a;
        let b = this.b;
        // a.rotation += .3
        // b.rotation += .5

        let primaryColor = '#CCC'
        let secondaryColor = '#444'
        let size = 30


        /* Draw an arc from rotation of `a` to rotation `b` */
        a.pen.arc(ctx, b, primaryColor, size, 2, 0)
        a.pen.arc(ctx, b, secondaryColor, size-10, 2, 1)

        b.pen.arc(ctx, a, secondaryColor, size, 2, 0)

        a.pen.indicator(ctx)
        b.pen.indicator(ctx)
}


/* Generic function outside with no arguments, stored within a const. */
var varStoreFunction = function( x = 0, y = 0 ){
    /* Generic function inside with no arguments, stored within a const. */
}

/* Generic function outside with no arguments, stored within a const. */
let letStoreFunction = function(){
    /* Generic function inside with no arguments, stored within a const. */
}



/* Comment outside for the class */
class ParentClass extends Array {
    /* Comment inside for the class*/

    otherName = 'window'
    oneval = 1

    /* Standard function type*/
    varfunc = function(){
        /* Standard function type*/
    }

    varfuncNamedFunc = function fred(){
    }

    /*
    Accepts no arguments and exists on the parent.
    */
    alphaMethod() {
        /*
        Accepts no arguments and exists on the parent.
        */
    }

    betaMethod() {
        /*
        Accepts no arguments.
        */
    }

    gammaMethod(one = null) {
        /*
        Parent with default arg
        */
    }

    get parentName() {
        return 'ParentClass';
    }

    set parentName(val) {
        this._parentName = val;
    }

    static staticParentMethod() {
        /*
        This is the comment for the Static parent method `staticParentMethod`
        */
    }


    [Symbol.toPrimitive](hint){
        /* this is the header block comment for Symbol.toPrimitive
        a very special method that converts an object to a primitive value based on the given hint.
        */
        // return this.value;

        let o = {
            'number': ()=>this.value
            , 'string': ()=> this.toString()
            // Upon operator (+)
            , 'default': ()=>this.value
        }

        let f = o[hint]
        f = (f == undefined)? f=()=>this:f

        return f()
    }

}


class Primary extends ParentClass {
    /* This is the header comment for the Primary class. Just within the class declaration. 

    This is the Primary class which extends ParentClass.
    */

    betaMethod() {
        /*
        Accepts no arguments and overrides the parent `betaMethod`
        */
    }

    charlieMethod(one, two = 1, three = {}) {
        /* docs for charlie */
    }

    deltaMethod(...args) {
        /*
        Variadic method using rest args
        */
    }

    epsilonMethod({ x = 0, y = 0 } = {}) {
        /*
        Destructured object with defaults
        */
    }

    // an inline comment for the getter `name`, set above the function
    get name() {
        // an inline comment **within** the getter `name`
        return 'Primary';
    }

    set name(value) {
        this._name = value;
    }

    static staticMethod(foo = 'bar') {
        /*
        Static method with default arg
        */
    }
}


function genericFunction() {
    /* Generic function with no arguments and a block comment */
    console.log('genericFunction')
}



function genericFunction2(argA, argB) {
    /* Generic function with two arguments and a block comment */
    console.log('genericFunction2')
}



import('./point-content.js')
const res = import('./point.js', { entryType: 'live'})

res.then(function(m){
    /* A comment within the `res.then` anon function */
    console.log('Imported point.js', m, m.Point)
})

/* The last block comment at the end of the file.*/
