(()=>{

    const isGetter = ( x, name ) => ( Object.getOwnPropertyDescriptor( x, name ) || {} ).get
    const isFunction = ( x, name ) => typeof x[ name ] === "function";

    const deepFunctions = x =>
      x && x !== Object.prototype &&
      Object.getOwnPropertyNames( x )
        .filter( name => isGetter( x, name ) || isFunction( x, name ) )
        .concat( deepFunctions( Object.getPrototypeOf( x ) ) || [] );

    const distinctDeepFunctions = x => {
        return Array.from(
            new Set(deepFunctions(x))
        )
    };

    const userFunctions = x => {
        return distinctDeepFunctions(x).filter(
            name => name !== "constructor" && !~name.indexOf( "__" )
        );
    }


    const readInstance = function(item) {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(item));
    }

    /*
    does not function
    */
    getAllMethods = function (obj, deep = Infinity) {
        let props = []

        while (
          (obj = Object.getPrototypeOf(obj)) && // walk-up the prototype chain
          Object.getPrototypeOf(obj) && // not the the Object prototype methods (hasOwnProperty, etc...)
          deep !== 0
        ) {
          const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter(
              (p, i, arr) =>
                typeof obj[p] === 'function' && // only the methods
                p !== 'constructor' && // not the constructor
                (i == 0 || p !== arr[i - 1]) && // not overriding in this prototype
                props.indexOf(p) === -1 // not overridden in a child
            )
          props = props.concat(l)
          deep--
        }

        return props
    }


    /*
    getAllProperties(new Point);
    (47) ['lerp', '0', '1', 'update', 'uuid', 'toString', '_liveProps',
    'asArray', 'asObject', 'pen', 'draw', 'isNaN', 'resolveStringOrFunction',
    'atan2', 'project', 'copy', 'magnitude', 'normalized', 'interpolateTo',
    'interpolateFrom', 'quantize', 'protractorAngleTo', 'lerpPixel',
    'rotation', 'rotate', 'radians', 'lookAt', 'directionTo', 'turnTo',
    'getTheta', 'x', 'y', 'radius', 'setSpecial', 'onSpecialSet',
    'getSpecial', 'set', '_cast', 'subtract', 'add', 'divide', 'multiply',
    'midpoint', 'randomize', 'getRelativeData', 'rel', 'xy']

    getAllProperties(Point);
    (8) ['from', 'distance', 'arguments', 'caller',
         'apply', 'bind', 'call', 'toString']
    */
    const getAllProperties = function(i=Stage, types=1) {
        let specials = new Set(['arguments', 'caller', 'callee'])
        let v = userFunctions(i)
        if(types > 0) {
            let r = {}
            v.forEach(k=>{
                  let type = 'unknown'

                  if(specials.has(k)) {
                      r[k] = 'special';
                      return
                  }
                  if(isFunction(i, k)) {
                      r[k] = 'function';
                      return
                  }

                  if(isGetter(i, k)) {
                      r[k] = 'getter';
                      return
                  }


                  r[k] = typeof(i[k]);
            })
            return r
        }

        return v;
    }

window.getAllProperties = getAllProperties
})();


/*
classMethodsA(new Point)
(45) {0: 0, 1: 0, uuid: '45f', _liveProps: true, update: ƒ, asArray: ƒ, asObject: ƒ, …}

classMethodsA(Point)
doc-index.js:83 Uncaught TypeError: 'caller', 'callee', and 'arguments' properties
    may not be accessed on strict mode functions or the arguments
    objects for calls to them
        at classMethodsA (doc-index.js:83:38)
        at <anonymous>:1:1
 */
function classMethodsA(obj) {
    let res = {};
    let p = Object.getPrototypeOf(obj)
    while (p.constructor !== Object) {
      for(const k of Object.getOwnPropertyNames(p)){
        if (!(k in res)) res[k] = obj[k];
      }
      p = Object.getPrototypeOf(p)
    }
    return res;
}


/*
classMethodsB(Point)
(11) ['length', 'name', 'prototype', 'distance', 'arguments', 'caller',
'constructor', 'apply', 'bind', 'call', 'toString']

classMethodsB(new Point)
(47) ['0', '1', 'constructor', 'update', 'uuid', 'toString', '_liveProps',
'asArray', 'asObject', 'pen', 'draw', 'isNaN', 'resolveStringOrFunction',
'atan2', 'project', 'copy', 'magnitude', 'normalized', 'interpolateTo',
'interpolateFrom', 'quantize', 'protractorAngleTo', 'lerpPixel',
'rotation', 'rotate', 'radians', 'lookAt', 'directionTo', 'turnTo',
 'getTheta', 'x', 'y', 'radius', 'setSpecial', 'onSpecialSet',
 'getSpecial', 'set', '_cast', 'subtract', 'add', 'divide', 'multiply',
 'midpoint', 'randomize', 'getRelativeData', 'rel', 'xy']

 */
function classMethodsB(obj) {
    let res = [];
    let p = Object.getPrototypeOf(obj);
    while (p.constructor !== Object) {
      for(const k of Object.getOwnPropertyNames(p)){
        if (!res.includes(k)) res.push(k);
      }
      p = Object.getPrototypeOf(p);
    }
    return res;
}




/*
getInstanceMethodNames(Point)
['distance']

getInstanceMethodNames(new Point)
(5) ['update', 'toString', 'asArray', 'asObject', 'isNaN']
 */
function getInstanceMethodNames(obj) {
    return Object
        .getOwnPropertyNames (Object.getPrototypeOf (obj))
        .filter(name => (name !== 'constructor' && typeof obj[name] === 'function'));
}
