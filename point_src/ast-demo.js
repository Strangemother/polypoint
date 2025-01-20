/*
This file presents a bunch of javascript for  _tree_ convert tool tes.t
*/

class ParentClass extends Array {

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
}

class Primary extends ParentClass {

    betaMethod() {
        /*
        Accepts no arguments and overrides the parent `betaMethod`
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

const constStoreFunction = function(){
    /* Generic function with no arguments, stored within a const. */
}


import('./point-content.js')
const res = import('./point.js', { entryType: 'live'})

res.then(function(m){
    console.log('Imported point.js', m, m.Point)
})
// debugger

// export default function foo(){}