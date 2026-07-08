/*
title: Soft-Body Blob Physics
category: soft-body
files:
    ../point_src/math.js
    head
    ../point_src/point-content.js
    pointlist
    point
    mouse
    stage
    dragging
    ../point_src/table.js

A Soft-body block point, with options to configure how blobby it should be.
(selection `f` is my favourite)
*/
let canvas, ctx;
let render, init;
let blob;


// const elasticityDefault = 0.0001;
// const frictionDefault = 0.065;
// const frictionDefault = 0.0085;
// const numPointsDefault = 32;

// const numPointsDefault = 8
// const elasticityDefault = 0.004;
// const frictionDefault = 0.04;

let oldMousePoint = { x: 0, y: 0};
let hover = false;


let keys = [
      "radius"
    , "elasticity"
    , "friction"
    , "numPoints"
]

const confTable = new Table(keys, {
      'default': [50, .0004,  0.04, 32,]
      , 'd':     [150, .0004,  0.04, 32,]
      , 'a':     [150, .0001,  0.065, 8,]
      , 'b':     [150, .0001,  0.065, 32,]
      , 'c':     [150, .0004,  0.086, 36,]
      , 'e':     [150, .0004,  0.04, 14,]
      , 'f':     [150, .004,  0.04, 24,]
      , 'g':     [150, .0001,  0.0084, 34,]
      , 'h':     [150, .0006,  0.0054, 34,]
      , 'i':     [150, .0009,  0.0084, 5,]
      , 'j':     [150, .001,  0.0054, 45,]
})


var settings = confTable.get('j')

// const elasticityDefault = settings.elasticity
// const frictionDefault = settings.friction
// const numPointsDefault = settings.numPoints


addControl('slider', {
    field: 'range'
    , stage: this
    , onchange(ev) {
        /*slider changed. */
        // debugger;
        let sval = ev.currentTarget.value
        this.stage.offset = parseFloat(sval) * .01
    }
})

addControl('choice', {
    field: 'select'
    , options: confTable.getKeys()
    , stage: this
    , onchange(ev) {
        let sval = ev.currentTarget.value
        settings = confTable.get(sval)
        console.log('change settings', sval)
        stage.mounted()
    }
})


class MyStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.center.radius = settings.radius
        blob = new Blob(this.center);
        blob.canvas = this.canvas;
        blob.init();
        // this.events.wake()
    }

    onMousemove(e) {

        let pos = blob.center;
        let diff = { x: e.offsetX - pos.x, y: e.offsetY - pos.y };
        let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
        let angle = null;

        blob.mousePos = { x: pos.x - e.offsetX, y: pos.y - e.offsetY };

        if(dist < blob.radius && hover === false) {
            let vector = { x: e.offsetX - pos.x, y: e.offsetY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = true;
            // blob.color = '#77FF00';
        } else if(dist > blob.radius && hover === true){
            let vector = { x: e.offsetX - pos.x, y: e.offsetY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = false;
            blob.color = null;
        }

        if(typeof angle == 'number') {
            let nearestPoint = null;
            let distanceFromPoint = 10;

            blob.points.forEach((point)=> {
                if(Math.abs(angle - point.azimuth) < distanceFromPoint) {
                    // console.log(point.azimuth, angle, distanceFromPoint);
                    nearestPoint = point;
                    distanceFromPoint = Math.abs(angle - point.azimuth);
                }

            });

            if(nearestPoint) {
                let strength = { x: oldMousePoint.x - e.offsetX, y: oldMousePoint.y - e.offsetY };
                strength = Math.sqrt((strength.x * strength.x) + (strength.y * strength.y)) * 10;
                if(strength > 100) strength = 100;
                nearestPoint.acceleration = strength / 100 * (hover ? -1 : 1);
            }
        }

        oldMousePoint.x = e.offsetX;
        oldMousePoint.y = e.offsetY;
    }

    draw(ctx){
        this.clear(ctx)
        blob.update();
    }
}


const solveWith = function(leftPoint, targetPoint, rightPoint) {
    let radialEffect = targetPoint.radialEffect;
    return (-0.3 * radialEffect
                + ( leftPoint.radialEffect - radialEffect )
                + ( rightPoint.radialEffect - radialEffect )
            ) * targetPoint.elasticity - targetPoint.speed * targetPoint.friction;
}



class Blob {
    constructor(placement={x:300, y: 300, radius: 100}) {
        this.points = [];
        this.color = '#661177';
        this.placement = placement
        this.radius = placement.radius;
    }

    init() {
        for(let i = 0; i < this.numPoints; i++) {
            let point = new BlobPoint(this.divisional * ( i + 1 ), this);
            // point.acceleration = -1 + Math.random() * 2;
            this.push(point);
        }
    }

    update() {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let position = this.position;
        let pointsArray = this.points;
        let radius = this.position.radius;
        let points = this.numPoints;
        let divisional = this.divisional;
        let center = this.placement;
        // let center = this.center;
        //
        pointsArray[0].acceleration = solveWith(
            pointsArray[points-1],
            pointsArray[0],
            pointsArray[1]
        );
        // pointsArray[0].solveWith(pointsArray[points-1], pointsArray[1]);

        let p0 = pointsArray[points-1].position;
        let p1 = pointsArray[0].position;
        let _p2 = p1;

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.moveTo( (p0.x + p1.x) * .5, (p0.y + p1.y) * .5 );

        for(let i = 1; i < points; i++) {

            pointsArray[i].acceleration = solveWith(
                pointsArray[i-1]
                , pointsArray[i]
                , pointsArray[i+1] || pointsArray[0]
            );
            // pointsArray[i].solveWith(pointsArray[i-1], pointsArray[i+1] || pointsArray[0]);

            let p2 = pointsArray[i].position;
            var xc = (p1.x + p2.x) * .5;
            var yc = (p1.y + p2.y) * .5;
            ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
            // ctx.lineTo(p2.x, p2.y);

            ctx.fillStyle = '#661177';
            // ctx.fillRect(p1.x-2.5, p1.y-2.5, 5, 5);

            p1 = p2;
        }

        var xc = (p1.x + _p2.x) * .5;
        var yc = (p1.y + _p2.y) * .5;
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
        // ctx.lineTo(_p2.x, _p2.y);

        // ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#661177';
        // ctx.stroke();

        /*
        ctx.fillStyle = '#000000';
        if(this.mousePos) {
          let angle = Math.atan2(this.mousePos.y, this.mousePos.x) + Math.PI;
          ctx.fillRect(center.x + Math.cos(angle) * this.radius, center.y + Math.sin(angle) * this.radius, 5, 5);
        }
        */
        // requestAnimationFrame(this.render.bind(this));
    }

    push(item) {
        if(item instanceof BlobPoint) {
            this.points.push(item);
        }
    }

    // set color(value) {
    //     this._color = value;
    // }

    // get color() {
    //     return this._color || '#661177';
    // }

    set canvas(value) {
        if(value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
            this._canvas = value;
            this.ctx = this._canvas.getContext('2d');
        }
    }

    get canvas() {
        return this._canvas;
    }

    set numPoints(value) {
        if(value > 2) {
            this._points = value;
        }
    }
    get numPoints() {
        return this._points || (settings.numPoints);
    }

    // set radius(value) {
    //     if(value > 0) {
    //         this._radius = value;
    //     }
    // }

    // get radius() {
    //     return this._radius || 150;
    // }

    set position(value) {
        if(typeof value == 'object' && value.x && value.y) {
            this._position = value;
        }
    }

    get position() {
        return this._position || { x: 0.5, y: 0.5 };
    }

    get divisional() {
        return Math.PI * 2 / this.numPoints;
    }

    get center() {
        return { x: this.canvas.width * this.position.x,
          y: this.canvas.height * this.position.y };
    }

    set running(value) {
        this._running = value === true;
    }

    get running() {
        return this.running !== false;
    }
}



class BlobPoint {
    constructor(azimuth, parent) {
        this.parent = parent;
        this.radialEffect = 0
        this.azimuth = Math.PI - azimuth;
        this._components = {
            x: Math.cos(this.azimuth),
            y: Math.sin(this.azimuth)
        };

        this.acceleration = .01//Math.random()
        this.elasticity = settings.elasticity;
        this.friction = settings.friction
    }

    set acceleration(value) {
        // if(typeof value == 'number') {
            this._acceleration = value;
            this.speed += this._acceleration * 2;
        // }
    }

    get acceleration() { return this._acceleration || 0; }

    set speed(value) {
        // if(typeof value == 'number') {
            this._speed = value;
            this.radialEffect += this._speed * 5;
        // }
    }

    get speed() { return this._speed || 0; }

    get position() {
        return {
            x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect),
            y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect)
        }
    }

    get components() { return this._components; }

    // set radialEffect(value) {
    //   if(typeof value == 'number') {
    //       this._radialEffect = value;
    //   }
    // }
    // get radialEffect() { return this._radialEffect || 0; }


    // set elasticity(value) {
    //     if(typeof value === 'number') {
    //         this._elasticity = value;
    //     }
    // }

    // get elasticity() {
    //     return this._elasticity || elasticityDefault;
    // }

    // set friction(value) {
    //     if(typeof value === 'number') {
    //       this._friction = value;
    //     }
    // }

    // get friction() { return this._friction || frictionDefault; }
}



stage = MyStage.go()