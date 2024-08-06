
const constrainDistance = function(pointA, pointB, maxDistance) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is greater than the maxDistance, move pointB closer
    if (distance > maxDistance) {
        const ratio = maxDistance / distance;
        const constrainedX = pointA.x - dx * ratio;
        const constrainedY = pointA.y - dy * ratio;
        pointB.x = constrainedX;
        pointB.y = constrainedY;
    }
    // If the distance is less than or equal to the maxDistance, pointB stays in place
}
