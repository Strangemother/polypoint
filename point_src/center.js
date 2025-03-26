/*
files:
    # compass.js
*/

let centerOfMass = {
    simple(points, origin) {
        /* Synonymous to:

            let totalX = 0;
            let totalY = 0;
            let numPoints = points.length;

            for (let i = 0; i < numPoints; i++) {
                totalX += points[i].x;
                totalY += points[i].y;
            }

            let centerX = totalX / numPoints;
            let centerY = totalY / numPoints;

            return point(centerX, centerY);
         */
        let total = point(0,0)
        if(origin) total.add(origin);

        points.forEach((p) => {
            total = total.add(p)
        })

        return total.divide(points.length);
    }

    , deep(points, origin) {
        /* Synonymous to:

            let totalMass = 0;
            let weightedSumX = 0;
            let weightedSumY = 0;
            let weightedSumRotation = 0;

            for (let i = 0; i < points.length; i++) {
                let mass = points[i].mass;
                // let z = points[i].z
                totalMass += mass;
                weightedSumX += points[i].x * points[i].mass;
                weightedSumY += points[i].y * points[i].mass;
                // weightedSumZ += z * points[i].mass;
                const rotation = points[i].rotation
                weightedSumRotation += rotation * mass
            }


            let centerX = weightedSumX / totalMass;
            let centerY = weightedSumY / totalMass;
            let centerRotation = weightedSumRotation / totalMass;

            let _point = point(centerX, centerY);
            _point.mass = totalMass
            _point.radius = totalMass
            _point.rotation = centerRotation
            return _point

        */
        let totalMass = 0;
        let weightedSum = point(0,0)
        if(origin) weightedSum.add(origin);

        let weightedSumRotation = 0;

        points.forEach((p)=>{
            let mass = p.radius;

            totalMass += mass;
            weightedSum = weightedSum.add(p.multiply(mass))
            weightedSumRotation += p.rotation * mass
        })

        let center = weightedSum.divide(totalMass)

        center.rotation = weightedSumRotation / totalMass;
        center.radius = center.mass = totalMass

        return center
    }
}

