
const conf = {
    'default': {
        minDistance: 30
        , attractionStrength: 0.004
        , repulsionStrength: 200
        , damping: 0.60
        , minVelocity: 0.1
        , maxVelocity: 5
    }
    , 'alt': {
        minDistance: 90
        , attractionStrength: 0.002
        , repulsionStrength: 100
        , damping: 0.66
        , minVelocity: 0.08
        , maxVelocity: 5
    }
    , 'gas': {
        minDistance: 100
        , attractionStrength: 0.001
        , repulsionStrength: 800
        , damping: 0.974
        , minVelocity: 0.1
        , maxVelocity: 9
        , itercount: 1
    }
    , 'blob': {
        minDistance: 90
        , attractionStrength: 0.002
        , repulsionStrength: 100
        , damping: 0.95
        , minVelocity: 0.1
        , maxVelocity: 20
        , itercount: 1
    }
}

const selectedConfigName = "blob" // "gas" // 'alt'
const settings = conf[selectedConfigName]


var points = PointList.generate.random(20, 500);
points.forEach(p => {
    p.vx = 0
    p.vy = 0
})


var pointsB = PointList.generate.random(20, 500);
pointsB.forEach(p => {
    p.vx = 0
    p.vy = 0
})

function gravitate(items, focul, settings) {
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


class MainStage extends Stage {

    mounted() {
        console.log('mounted')
        this.settings = settings
    }

    draw(ctx) {
        let settings = this.settings
        let center = stage.center
        let targetPosition = Point.mouse.position;

        let c = settings.itercount
        if(c == undefined) { c = 10 }
        for (var i = 0; i < c; i++) {
            gravitate(points, center, settings);
        }

        gravitateSquareDistance(pointsB, targetPosition, settings);

        this.clear(ctx)
        this.drawPoints(ctx);
        pointsB.pen.indicators(ctx)
        pointsB.centerOfMass().pen.indicator(ctx)
        points.centerOfMass().pen.indicator(ctx)
    }

    drawPoints(ctx) {
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

    }
}

const stage = new MainStage('canvas')
stage.loopDraw()
// stage.go()
