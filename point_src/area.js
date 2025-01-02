

const pointArea = function(p) {
    return circleArea(p.radius)
}

const pointCircumference = function(p) {
    return radiusCircumference(p.radius)
}

const radiusCircumference = function(radius) {
    return 2 * Math.PI * radius
}


const circleArea = (radius, pi=Math.PI) => {
   return pi * radius * radius;
};

