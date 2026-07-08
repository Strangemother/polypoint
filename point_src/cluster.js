/*
Perform Point clustering, ensuring many points gravitate to their siblings,
but at a general distance.
*/


const simpleCluster = function(points, targetPosition, settings, opts) {
    /* the simpleCluster function quickly initiates _clustering_ on a collection
    of points, using optional settings.

    Example:

        simpleCluster(points, pointA, settings, {func: clusterStyleB, itercount: c});

    Synonymous to:

        let c = settings.itercount
        if(c == undefined) { c = 10 }
        for (var i = 0; i < c; i++) {
            clusterStyleB(points, pointA, settings);
            // clusterStable(points, pointA, settings);
        }
    */

    // Generally "stable" settings.
    let defaultSettings = {
            minDistance: 100
            , attractionStrength: 0.001
            , repulsionStrength: 80
            , damping: 0.974
            , minVelocity: 0.01
            , maxVelocity: 9
            , itercount: 1
            // , func
        }

    settings = Object.assign(defaultSettings, settings, opts)
    let func =  settings.func || clusterStable // clusterStyleB
    let c = settings.itercount
    if(c == undefined) { c = 1 };

    for (var i = 0; i < c; i++) {
        // clusterStable(points, pointA, settings);
        func(points, targetPosition, settings);
    }
}


function clusterStyleB(items, focul, settings) {
    const centerX = focul == undefined? canvas.width * .5: focul.x
        , centerY = focul == undefined? canvas.height * .5: focul.y
        , minDistance = settings.minDistance
        , minVelocity = settings.minVelocity
        , maxVelocity = settings.maxVelocity
        , damping = settings.damping
        , repulsionStrength = settings.repulsionStrength
        , attractionStrength = settings.attractionStrength
        , method = settings.method || 'general'
        ;

    const _xyd = function(item) {
        const dx = centerX - item.x;
        const dy = centerY - item.y;
        const distance = item.distanceTo({x:centerX, y:centerY})
        return [dx,dy,distance]
    }

    const m = {

        springy(item) {
            // springy
            let xyd = _xyd(item)
            const at = (xyd[2] * .0001) + attractionStrength

            item.vx += at * xyd[0];
            item.vy += at * xyd[1];

        }
        , general(item){
            // general
            let xyd = _xyd(item)
            const at = (xyd[2] * .0001) + attractionStrength

            item.vx += at * xyd[0];
            item.vy += at * xyd[1];

        }
        , squareDistance(item) {
            // square distance
            let xyd = _xyd(item)
            // const dx = centerX - item.x;
            // const dy = centerY - item.y;
            // const distance = item.distanceTo({x:centerX, y:centerY}) * .0004
            const distance = xyd[2] * .0004

            const at = (attractionStrength * .01) +  ((distance * distance) * .03)

            item.vx +=  at * xyd[0];
            item.vy +=  at * xyd[1];
        }
    }

    const oneItem = function(items, i) {

        let item = items[i]
        for (let j = 0; j < items.length; j++) {
            if (i == j) {
                continue
            }

            const other = items[j]
            const dxy = other.subtract(item)
            const distance = item.distanceTo(other)

            if (distance > minDistance) {
                /* If the distance is too far, we dont perform the
                replusion force below ...*/
                continue
            }

            const repulsionForce = repulsionStrength / (distance * distance);
            item.vx -= repulsionForce * dxy.x / distance;
            item.vy -= repulsionForce * dxy.y / distance;
        }

        // m.general(item)
        // m.squareDistance(item)
        m[method](item)

        item.vx *= damping;
        item.vy *= damping;

        limitSpeed(minVelocity, maxVelocity, item)

        item.x += item.vx;
        item.y += item.vy;
    }

    for (let i = 0; i < items.length; i++) {
        oneItem(items, i)
    }
}


function limitSpeed(minVelocity, maxVelocity, item) {

        let vx = item.vx
        let vy = item.vy
        let avx = Math.abs(vx)
        let avy = Math.abs(vy)

        if (avx < minVelocity){ item.vx = 0;}
        if (avy < minVelocity){ item.vy = 0;}

        if (avx > maxVelocity){ item.vx = (2 * (vx > 0) - 1) * maxVelocity;}
        if (avy > maxVelocity){ item.vy = (2 * (vy > 0) - 1) * maxVelocity;}

        return item
}


function clusterStable(items, focul, settings) {
    const centerX = focul.x
        , centerY = focul.y
        , minDistance = settings.minDistance
        , minVelocity = settings.minVelocity
        , maxVelocity = settings.maxVelocity
        , damping = settings.damping
        , repulsionStrength = settings.repulsionStrength
        , attractionStrength = settings.attractionStrength
        ;

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        for (let j = 0; j < items.length; j++) {
            if (i == j) {
                continue
            }
            const other = items[j]
            const dxy = other.subtract(item)
            const distance = item.distanceTo(other)

            if (distance > minDistance) {
                /* If the distance is too far, we dont perform the
                replusion force below ...*/
                continue
            }

            const repulsionForce = repulsionStrength / (distance * distance);
            item.vx -= repulsionForce * dxy.x / distance;
            item.vy -= repulsionForce * dxy.y / distance;
        }


        const dx = centerX - item.x;
        const dy = centerY - item.y;
        const distance = item.distanceTo({x:centerX, y:centerY})

        const distanceSpeed = distance * .0001

        item.vx += distanceSpeed + attractionStrength * dx;
        item.vy += distanceSpeed + attractionStrength * dy;

        item.vx *= damping;
        item.vy *= damping;

        let avx = Math.abs(item.vx)
        let avy = Math.abs(item.vy)

        if (avx < minVelocity) item.vx = 0;
        if (avx < minVelocity) item.vx = 0;

        if (avx > maxVelocity) item.vx = maxVelocity;
        if (avy > maxVelocity) item.vy = maxVelocity;

        item.x += item.vx;
        item.y += item.vy;
    }
}


function gravitateSquareDistance(items, focul, settings) {
    const centerX = focul == undefined? canvas.width * .5: focul.x
        , centerY = focul == undefined? canvas.height * .5: focul.y
        , minDistance = settings.minDistance
        , minVelocity = settings.minVelocity
        , maxVelocity = settings.maxVelocity
        , damping = settings.damping
        , repulsionStrength = settings.repulsionStrength
        , attractionStrength = settings.attractionStrength
        ;

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        for (let j = 0; j < items.length; j++) {
            if (i == j) {
                continue
            }
            const other = items[j]
            const dxy = other.subtract(item)
            const distance = item.distanceTo(other)

            if (distance > minDistance) {
                /* If the distance is too far, we dont perform the
                replusion force below ...*/
                continue
            }

            const repulsionForce = repulsionStrength / (distance * distance);
            item.vx -= repulsionForce * dxy.x / distance;
            item.vy -= repulsionForce * dxy.y / distance;
        }


        const dx = centerX - item.x;
        const dy = centerY - item.y;
        const distance = item.distanceTo({x:centerX, y:centerY}) * .0004

        const at = (attractionStrength * .01) +  ((distance * distance) * .03)

        item.vx +=  at * dx;
        item.vy +=  at * dy;

        item.vx *= damping;
        item.vy *= damping;

        let avx = Math.abs(item.vx)
        let avy = Math.abs(item.vy)

        if (avx < minVelocity) item.vx = 0;
        if (avx < minVelocity) item.vx = 0;

        if (avx > maxVelocity) item.vx = maxVelocity;
        if (avy > maxVelocity) item.vy = maxVelocity;

        item.x += item.vx;
        item.y += item.vy;
    }
}

