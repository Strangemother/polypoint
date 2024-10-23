function pseudo3DRotate(points, rotationAngles, rotationCenter, offset=true) {
    // rotationAngles: { x: angleX, y: angleY, z: angleZ } in degrees
    // rotationCenter: { x: centerX, y: centerY } - the point around which to rotate

    // Convert angles from degrees to radians
    const toRadians = angle => angle * (Math.PI / 180);
    const angleX = toRadians(rotationAngles.x || 0);
    const angleY = toRadians(rotationAngles.y || 0);
    const angleZ = toRadians(rotationAngles.z || 0);

    // Precompute trigonometric values
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);

    // Rotation matrices around each axis
    const rotateX = point => ({
        x: point.x,
        y: point.y * cosX - point.z * sinX,
        z: point.y * sinX + point.z * cosX,
    });

    const rotateY = point => ({
        x: point.x * cosY + point.z * sinY,
        y: point.y,
        z: -point.x * sinY + point.z * cosY,
    });

    const rotateZ = point => ({
        x: point.x * cosZ - point.y * sinZ,
        y: point.x * sinZ + point.y * cosZ,
        z: point.z,
    });

    // Translate points to rotate around the rotation center
    const translatedPoints = points.map(point => ({
        x: point.x - rotationCenter.x,
        y: point.y - rotationCenter.y,
        z: 0, // Initial Z coordinate
        radius: point.radius
    }));

    // Apply rotations
    const rotatedPoints = translatedPoints.map(point => {
        let rotatedPoint = point;

        // Apply rotations in order Z -> Y -> X
        rotatedPoint = rotateZ(rotatedPoint)
        rotatedPoint = rotateY(rotatedPoint)
        rotatedPoint = rotateX(rotatedPoint)
        if(offset){
            rotatedPoint.x += rotationCenter.x
            rotatedPoint.y += rotationCenter.y
        }
        rotatedPoint.radius = point.radius
        return rotatedPoint;
    });

    return rotatedPoints;
}


function pseudo3DRotatePerspective(rotatedPoints, rotationCenter, distance) {
    // Project back to 2D using perspective projection and translate back
    const projectedPoints = rotatedPoints.map(point => {
        const factor = distance / (distance + point.z);
        return {
            x: (point.x * factor) + rotationCenter.x,
            y: (point.y * factor) + rotationCenter.y,
            radius: point.radius * factor
        };
    });

    return projectedPoints;
}


