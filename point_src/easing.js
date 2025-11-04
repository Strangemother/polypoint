
// --------------- Linear --------------------

/**
 * Linear easing with no acceleration.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const linearInOut = function(t) {

    return t
}

// --------------- Quadratic easing functions --------------------

/**
 * Quadratic easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quadEaseInOut = function(t) {
    if(t < 0.5){
        return 2 * t * t
    }

    return (-2 * t * t) + (4 * t) - 1
}

/**
 * Quadratic easing in - accelerating from zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quadEaseIn = function(t) {

    return t * t
}

/**
 * Quadratic easing out - decelerating to zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quadEaseOut = function(t) {
    return -(t * (t - 2))
}

// --------------- Cubic easing functions --------------------

/**
 * Cubic easing in - accelerating from zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const cubicEaseIn = function(t) {

    return t * t * t
}

/**
 * Cubic easing out - decelerating to zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const cubicEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) + 1
}

/**
 * Cubic easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const cubicEaseInOut = function(t) {

    if (t < 0.5){
        return 4 * t * t * t
    }
    var p = 2 * t - 2
    return 0.5 * p * p * p + 1
}

// --------------- Quartic easing functions --------------------

/**
 * Quartic easing in - accelerating from zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quarticEaseIn = function(t) {

    return t * t * t * t
}

/**
 * Quartic easing out - decelerating to zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quarticEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) * (1 - t) + 1
}

/**
 * Quartic easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quarticEaseInOut = function(t) {

    if( t < 0.5){
        return 8 * t * t * t * t
    }
    var p = t - 1
    return -8 * p * p * p * p + 1
}

// --------------- Quintic easing functions --------------------

/**
 * Quintic easing in - accelerating from zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quinticEaseIn = function(t) {

    return t * t * t * t * t
}

/**
 * Quintic easing out - decelerating to zero velocity.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quinticEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) * (t - 1) * (t - 1) + 1
}

/**
 * Quintic easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const quinticEaseInOut = function(t) {

    if( t < 0.5){
        return 16 * t * t * t * t * t
    }
    var p = (2 * t) - 2
    return 0.5 * p * p * p * p * p + 1
}

// --------------- Sine easing functions --------------------

/**
 * Sine easing in - accelerating using a sine wave.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const sineEaseIn = function(t) {

    return Math.sin((t - 1) * Math.PI / 2) + 1
}

/**
 * Sine easing out - decelerating using a sine wave.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const sineEaseOut = function(t) {

    return Math.sin(t * Math.PI / 2)
}

/**
 * Sine easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const sineEaseInOut = function(t) {

    return 0.5 * (1 - Math.cos(t * Math.PI))
}

// --------------- Circular easing functions --------------------

/**
 * Circular easing in - accelerating using a circular function.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const circularEaseIn = function(t) {

    return 1 - Math.sqrt(1 - (t * t))
}

/**
 * Circular easing out - decelerating using a circular function.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const circularEaseOut = function(t) {

    return Math.sqrt((2 - t) * t)
}

/**
 * Circular easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const circularEaseInOut = function(t) {

    if( t < 0.5){
        return 0.5 * (1 - Math.sqrt(1 - 4 * (t * t)))
    }
    return 0.5 * (Math.sqrt(-((2 * t) - 3) * ((2 * t) - 1)) + 1)
}

// --------------- Exponential easing functions --------------------

/**
 * Exponential easing in - accelerating exponentially.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const exponentialEaseIn = function(t) {

    if(t == 0){
        return 0
    }
    return Math.pow(2, 10 * (t - 1))
}

/**
 * Exponential easing out - decelerating exponentially.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const exponentialEaseOut = function(t) {

    if(t == 1){
        return 1
    }
    return 1 - Math.pow(2, -10 * t)
}

/**
 * Exponential easing in and out.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const exponentialEaseInOut = function(t) {

    if( t == 0 || t == 1){
        return t
    }

    if( t < 0.5){
        return 0.5 * Math.pow(2, (20 * t) - 10)
    }
    return -0.5 * Math.pow(2, (-20 * t) + 10) + 1
}

// --------------- Elastic Easing Functions --------------------

/**
 * Elastic easing in - with elastic bouncing effect at the start.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const elasticEaseIn = function(t) {

    return Math.sin(13 * Math.PI / 2 * t) * Math.pow(2, 10 * (t - 1))
}

/**
 * Elastic easing out - with elastic bouncing effect at the end.
 * @param {number} t - Progress value between 0 and 1
 * @param {number} p - Power factor for the exponential decay (default: -10)
 * @returns {number} Eased value
 */
const elasticEaseOut = function(t, p=-10) {

    return Math.sin(-13 * Math.PI / 2 * (t + 1)) * Math.pow(2, p * t) + 1
}

/**
 * Elastic easing in and out - with elastic bouncing effect at both ends.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const elasticEaseInOut = function(t) {

    if (t < 0.5) {
        return (
            0.5
            * Math.sin(13 * Math.PI / 2 * (2 * t))
            * Math.pow(2, 10 * ((2 * t) - 1))
        )
    }

    return 0.5 * (
        Math.sin(-13 * Math.PI / 2 * ((2 * t - 1) + 1))
        * Math.pow(2, -10 * (2 * t - 1))
        + 2
    )
}

// --------------- Back Easing Functions --------------------

/**
 * Back easing in - pulls back slightly before accelerating forward.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const backEaseIn = function(t) {

    return t * t * t - t * Math.sin(t * Math.PI)
}

/**
 * Back easing out - overshoots slightly before settling at the target.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const backEaseOut = function(t) {

    var p = 1 - t
    return 1 - (p * p * p - p * Math.sin(p * Math.PI))
}

/**
 * Back easing in and out - pulls back and overshoots at both ends.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const backEaseInOut = function(t) {

    if( t < 0.5){

        var p = 2 * t
        return 0.5 * (p * p * p - p * Math.sin(p * Math.PI))
    }

    var p = 1 - (2 * t - 1)

    return 0.5 * (1 - (p * p * p - p * Math.sin(p * Math.PI))) + 0.5
}

// --------------- Bounce Easing Functions --------------------

/**
 * Bounce easing in - with bouncing effect at the start.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const bounceEaseIn = function(t) {

    return 1 - bounceEaseOut(1 - t)
}

/**
 * Bounce easing out - with bouncing effect at the end.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const bounceEaseOut = function(t) {

    if (t < 4 / 11) {
        return 121 * t * t / 16
    }

    if (t < 8 / 11) {
        return (363 / 40.0 * t * t) - (99 / 10.0 * t) + 17 / 5.0
    }

    if (t < 9 / 10) {
        return (4356 / 361.0 * t * t) - (35442 / 1805.0 * t) + 16061 / 1805.0
    }
    return (54 / 5.0 * t * t) - (513 / 25.0 * t) + 268 / 25.0
}

/**
 * Bounce easing in and out - with bouncing effect at both ends.
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
const bounceEaseInOut = function(t) {

    if( t < 0.5){
        return 0.5 * bounceEaseIn(t * 2)
    }
    return 0.5 * bounceEaseOut(t * 2 - 1) + 0.5
}

// ----
//

/**
 * Combines multiple easing functions by averaging their outputs.
 * @param {...Function} functions - Easing functions to combine
 * @returns {Function} Combined easing function
 */
const multiEase = function(...functions) {

    const mergeFuncs = functions
    const stepper = function(t){
        let r = 0
        mergeFuncs.forEach(e=>r += e(t))
        return r / mergeFuncs.length
    }

    return stepper
}

/**
 * Collection of all easing functions organized by type and direction.
 * Access patterns: easingFunctions.quad.inOut, easingFunctions.sine.in, etc.
 */
const easingFunctions = {
    /* A neat little collector for easing methods - built into an object.

        easing = EasingFunctions
        easing.quad.inOut
        easing.quad.in
        easing.quad.out
    */
    defaultName: 'linear'
    , get(name=this.defaultName, anchor='inOut') {
        return this[name][anchor]
    }
    , linear: {
        inOut: linearInOut
    }
    , quad:{
        in: quadEaseIn
        , out: quadEaseOut
        , inOut: quadEaseInOut
    }
    , cubic:{
        in: cubicEaseIn
        , out: cubicEaseOut
        , inOut: cubicEaseInOut
    }
    , quartic:{
        in: quarticEaseIn
        , out: quarticEaseOut
        , inOut: quarticEaseInOut
    }
    , quintic:{
        in: quinticEaseIn
        , out: quinticEaseOut
        , inOut: quinticEaseInOut
    }
    , sine:{
        in: sineEaseIn
        , out: sineEaseOut
        , inOut: sineEaseInOut
    }
    , circular:{
        in: circularEaseIn
        , out: circularEaseOut
        , inOut: circularEaseInOut
    }
    , exponential:{
        in: exponentialEaseIn
        , out: exponentialEaseOut
        , inOut: exponentialEaseInOut
    }
    , elastic:{
        in: elasticEaseIn
        , out: elasticEaseOut
        , inOut: elasticEaseInOut
    }
    , back:{
        in: backEaseIn
        , out: backEaseOut
        , inOut: backEaseInOut
    }
    , bounce:{
        in: bounceEaseIn
        , out: bounceEaseOut
        , inOut: bounceEaseInOut
    }
}
