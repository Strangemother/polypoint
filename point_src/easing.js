
// """
// Linear
// """
const linearInOut = function(t) {

    return t
}

// """
// Quadratic easing functions
// """


const quadEaseInOut = function(t) {

    if(t < 0.5){
        return 2 * t * t
    }
    return (-2 * t * t) + (4 * t) - 1
}


const quadEaseIn = function(t) {

    return t * t
}


const quadEaseOut = function(t) {

    return -(t * (t - 2))
}


// """
// Cubic easing functions
// """


const cubicEaseIn = function(t) {

    return t * t * t
}


const cubicEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) + 1
}


const cubicEaseInOut = function(t) {

    if (t < 0.5){
        return 4 * t * t * t
    }
    var p = 2 * t - 2
    return 0.5 * p * p * p + 1
}


// """
// Quartic easing functions
// """


const quarticEaseIn = function(t) {

    return t * t * t * t
}


const quarticEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) * (1 - t) + 1
}


const quarticEaseInOut = function(t) {

    if( t < 0.5){
        return 8 * t * t * t * t
    }
    var p = t - 1
    return -8 * p * p * p * p + 1
}


// """
// Quintic easing functions
// """


const quinticEaseIn = function(t) {

    return t * t * t * t * t
}


const quinticEaseOut = function(t) {

    return (t - 1) * (t - 1) * (t - 1) * (t - 1) * (t - 1) + 1
}


const quinticEaseInOut = function(t) {

    if( t < 0.5){
        return 16 * t * t * t * t * t
    }
    var p = (2 * t) - 2
    return 0.5 * p * p * p * p * p + 1

}

// """
// Sine easing functions
// """


const sineEaseIn = function(t) {

    return Math.sin((t - 1) * PI / 2) + 1
}


const sineEaseOut = function(t) {

    return Math.sin(t * PI / 2)
}


const sineEaseInOut = function(t) {

    return 0.5 * (1 - Math.cos(t * PI))
}


// """
// Circular easing functions
// """


const circularEaseIn = function(t) {

    return 1 - Math.sqrt(1 - (t * t))
}


const circularEaseOut = function(t) {

    return Math.sqrt((2 - t) * t)
}


const circularEaseInOut = function(t) {

    if( t < 0.5){
        return 0.5 * (1 - Math.sqrt(1 - 4 * (t * t)))
    }
    return 0.5 * (Math.sqrt(-((2 * t) - 3) * ((2 * t) - 1)) + 1)
}


// """
// Exponential easing functions
// """


const exponentialEaseIn = function(t) {

    if( t == 0){
        return 0
    }
    return Math.pow(2, 10 * (t - 1))
}


const exponentialEaseOut = function(t) {

    if( t == 1){
        return 1
    }
    return 1 - Math.pow(2, -10 * t)
}


const exponentialEaseInOut = function(t) {

    if( t == 0 or t == 1){
        return t
    }

    if( t < 0.5){
        return 0.5 * Math.pow(2, (20 * t) - 10)
    }
    return -0.5 * Math.pow(2, (-20 * t) + 10) + 1
}


// """
// Elastic Easing Functions
// """


const elasticEaseIn = function(t) {

    return Math.sin(13 * PI / 2 * t) * Math.pow(2, 10 * (t - 1))
}


const elasticEaseOut = function(t) {

    return Math.sin(-13 * PI / 2 * (t + 1)) * Math.pow(2, -10 * t) + 1
}


const elasticEaseInOut = function(t) {

    if (t < 0.5) {
        return (
            0.5
            * Math.sin(13 * PI / 2 * (2 * t))
            * Math.pow(2, 10 * ((2 * t) - 1))
        )
    }

    return 0.5 * (
        Math.sin(-13 * PI / 2 * ((2 * t - 1) + 1))
        * Math.pow(2, -10 * (2 * t - 1))
        + 2
    )

}

// """
// Back Easing Functions
// """


const backEaseIn = function(t) {

    return t * t * t - t * Math.sin(t * PI)

}

const backEaseOut = function(t) {

    var p = 1 - t
    return 1 - (p * p * p - p * Math.sin(p * PI))
}


const backEaseInOut = function(t) {

    if( t < 0.5){

        var p = 2 * t
        return 0.5 * (p * p * p - p * Math.sin(p * PI))
    }

    var p = 1 - (2 * t - 1)

    return 0.5 * (1 - (p * p * p - p * Math.sin(p * PI))) + 0.5

}

// """
// Bounce Easing Functions
// """


const bounceEaseIn = function(t) {

    return 1 - BounceEaseOut(1 - t)
}


const bounceEaseOut = function(t) {

    if t < 4 / 11:
        return 121 * t * t / 16
    elif t < 8 / 11:
        return (363 / 40.0 * t * t) - (99 / 10.0 * t) + 17 / 5.0
    elif t < 9 / 10:
        return (4356 / 361.0 * t * t) - (35442 / 1805.0 * t) + 16061 / 1805.0
    return (54 / 5.0 * t * t) - (513 / 25.0 * t) + 268 / 25.0
}


const bounceEaseInOut = function(t) {

    if( t < 0.5){
        return 0.5 * BounceEaseIn(t * 2)
    }
    return 0.5 * BounceEaseOut(t * 2 - 1) + 0.5
}
