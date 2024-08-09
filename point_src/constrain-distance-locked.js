const followPoint = function(pointA, pointB, followDistance) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the desired position of pointB
    const ratio = followDistance / distance;
    const desiredX = pointA.x - dx * ratio;
    const desiredY = pointA.y - dy * ratio;

    // Update the position of pointB to follow pointA at the specified distance
    pointB.x = desiredX;
    pointB.y = desiredY;
}

const lerp = (x, y, a) => x * (1 - a) + y * a;
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
const invlerp = (x, y, a) => clamp((a - x) / (y - x));
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

