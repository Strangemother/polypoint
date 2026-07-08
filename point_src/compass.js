/*

*/
Math.PI2 = Math.PI * 2
const TAU = 2 * Math.PI;

const RIGHT = 0
const DOWN = Math.PI*.5;
const LEFT = Math.PI * 1;
const UP = Math.PI*1.5;

const RIGHT_DEG = radiansToDegrees(0);
const DOWN_DEG = radiansToDegrees(Math.PI *.5);
const LEFT_DEG = radiansToDegrees(Math.PI  * 1);
const UP_DEG = radiansToDegrees(Math.PI *1.5);


class Compass {

    constructor(setup={}) {
        this.func = setup.func
    }

    setDeg() {
        this.func = radiansToDegrees
    }

    setRad() {
        this.func = undefined;
    }

    static degrees() {
        return new Compass({
            func: radiansToDegrees
        })
    }

    static get rad() {
        return new Compass()
    }

    get(v) {
        return this.conv(v)
    }

    get right(){
         return this.conv(0)
    }

    get down(){
         return this.conv(Math.PI *.5)
    }

    get left(){
         return this.conv(Math.PI * 1)
    }

    get up(){
         return this.conv(Math.PI * 1.5)
    }

    conv(v) {
        if(this.func) {
            return this.func(v)
        }
        return v
    }
}


function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}


const radiansToTau = function(radians) {
    /*
        let radians = Math.PI; // 1/2 TAU
        console.log(radiansToTau(radians)); // Outputs: 0.5
    */
    return radians / TAU;
}


const degToRad = function(value) {
    return value * (Math.PI / 180);
}


function projectFrom(origin, distance=undefined, rotation=undefined) {
    // Convert rotation angle from degrees to radians
    if(rotation === undefined) {
        rotation = origin.rotation
    }

    if(distance === undefined) {
        distance = origin.radius
    }

    const rotationInRadians = degToRad(rotation)

    // Calculate the new x and y coordinates
    const x = origin.x + distance * Math.cos(rotationInRadians);
    const y = origin.y + distance * Math.sin(rotationInRadians);

    return { x, y };
}

Polypoint.head.install(Compass)


Polypoint.head.deferredProp('Stage', function compass(){
    return Compass.degrees()
})

