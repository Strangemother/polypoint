/*

src_dir: ../point_src/
categories: gravity
    raw
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/rel.js
    dragging
    ../point_src/constrain-distance.js
    ../point_src/screenwrap.js

 */
// window.requestAnimFrame =
// window.requestAnimationFrame       ||
// window.webkitRequestAnimationFrame ||
// window.mozRequestAnimationFrame    ||
// window.oRequestAnimationFrame      ||
// window.msRequestAnimationFrame     ||
// function(callback) {
//     window.setTimeout(callback, 1000 / 60);
// };
var n_tmp;

var Utils = {
    dist : function (pl, dps) {
        return Math.sqrt(
                Math.pow(pl.x - dps.x, 2) + Math.pow(pl.y - dps.y, 2)
            )
    }
}


// let asteroidToAsteroidBounciness = 1
let asteroidToAsteroidBounciness = .4
let asteroidToPlanetBounciness = 1

let clampMin = -10
    , clampMax = 10
    /* how much each particle tends towards the others.
    above 1.5, particles tend towards massing.
    below 1.5, particles act more like air */
    , discoveryEagerness = 1
    // , discoveryEagerness = 60
    // , discoveryEagerness = 1

    /* less for gasses, more for gravity boids*/
    , grabStrength = 1
    // , grabStrength = 6
    // , grabStrength = -2
    , asteroidCount = 200
    ;


class World {

    constructor() {
        this.entities = [];
        this.debug = false;
        this.pause = false;
        this.fpsMax = 60;
        this.g = .1;
        this.canvas = "";
        this.context = "";
        this.mousedown = false;
    }

    init(canvas) {

        var _this;

        _this = this
        n_tmp = undefined

        this.canvas = canvas// document.getElementById("playspace");
        // this.canvas.width = 800;
        // this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");

        // this.generatePlanets()
        this.generateAsteroids(asteroidCount, 10)
        // this.generateInversePlanets()

        this.loop();
    }

    plotRand(v){
        return Math.floor(Math.random() * v) % (v - 200) + 100
    }

    generatePlanets(){
        // Generating planets
        for (var i = 0; i < 3; i++) {
            var tmp = new Planet(
                this.plotRand(this.canvas.width)
              , this.plotRand(this.canvas.height)
              , Math.floor(Math.random() * 100) + 20
              , "#9922EE"
            );
            this.entities.push(tmp);
        }
    }

    generateInversePlanets(){

        for (var i = 0; i < 3; i++) {
            var tmp = new Planet(
                    this.plotRand(this.canvas.width)
                  , this.plotRand(this.canvas.height)
                  , Math.floor(Math.random() * -100) - 20
                  , "#ccc"
            );
            this.entities.push(tmp);
        }
    }

    generateAsteroids(count, size=10){

        // Generating asteroids
        for (var i = 0; i < count; i++) {
             var tmp = new Asteroid(
              this.plotRand(this.canvas.width)
              , this.plotRand(this.canvas.height)
              , size
              , "#99DDAA"
              , i
            );
            this.entities.push(tmp);
        }
    }

    loop() {
        var _this;
        _this = this;

        this.entities.forEach((elem, index) => {
            if (elem != undefined){
                elem.run(_this);
                this.draw(_this.context, elem);
            }
        });

        return true;
    }

    draw(context, p) {
        // if (typeof context != "object" || !(context instanceof CanvasRenderingContext2D)) {
        //     return false;
        // }
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, Math.abs(p.m) / 2, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();
        return true;
    }
}



class Entity extends Point {
    // EPoint.call(this, x, y);
    constructor(x,y, m, color) {
        super(x,y)
        this.m = m;
        this.r = Math.abs(this.m) / 2;
        this.color = color;
        this.onclick = function() { };
    }

    // draw(context) {
    //     // if (typeof context != "object" || !(context instanceof CanvasRenderingContext2D)) {
    //     //     return false;
    //     // }
    //     context.fillStyle = this.color;
    //     context.beginPath();
    //     context.arc(this.x, this.y, Math.abs(this.m) / 2, 0, 2 * Math.PI, false);
    //     context.fill();
    //     context.closePath();
    //     return true;
    // }
}


class Planet extends Entity {
    // Planet = function(x, y, m, color) {
    //   Entity.call(this, x, y, m, color);
    // }
    run() {
      return true;
    }

}


var screenWrap


class Asteroid extends Entity {

    constructor(x, y, m, color, index) {
      super(x, y, m, color);
      this.vx = 0;
      this.vy = 0;
      this.cos = NaN;
      this.sin = NaN;
      this.index = index
    }


    run2(world) {
        var vdist, d_x, d_y, tan, cos, sin, force_grav, _this, len, elem, a, pen

        _this = this

        if (typeof world != "object" || !(world instanceof World)
            || world.pause) {
            return false
        }
        len = world.entities.length
        elem = world.entities
        // let startIndex = this.index + 1
        // len = startIndex + 1
        /* Asteroids motion.*/
        for (var i = 0; i < len; i++) {
            let el = elem[i]
            if(el == undefined || el instanceof Planet){
                continue
            }

            /* distance to this target. */
            a = _this.r + el.r;

            /* Boundry death */
            if(el.x < 0
                || el.y < 0
                || el.x > 2000
                || el.y > 2000) {
                el.x = 100 + Math.random() * 800
                el.y = 100 + Math.random() * 800
                continue
            }

            vdist = Utils.dist(_this, el)

            if (vdist == 0 || vdist >= a) {
                continue
            }


            /* Asteroid to asteroid impact.*/
            pen = vdist - a
            cos = (-_this.x + el.x) / vdist
            sin = (-_this.y + el.y) / vdist
            _this.vx = _this.vx * .5 + cos * (pen * asteroidToAsteroidBounciness)
            _this.vy = _this.vy * .5 + sin * (pen * asteroidToAsteroidBounciness)
        }

        /* Planet gravities. */
        for (var i = 0; i < len; i++) {
            if (elem[i] == undefined
                // || elem[i] instanceof Asteroid
                ) {
                continue
            }

            vdist = Utils.dist(_this, elem[i])
            if (vdist == 0) {
                continue
            }


            d_x = -_this.x + elem[i].x;
            d_y = -_this.y + elem[i].y;
            cos = d_x / vdist;
            sin = d_y / vdist;
            force_grav = world.g * (_this.m * elem[i].m) / Math.pow(vdist, 2);

            _this.vx = _this.vx + cos * force_grav;
            _this.vy = _this.vy + sin * force_grav;
            pen = vdist - (_this.r + elem[i].r);

            if (pen < 0) {
                _this.vx = _this.vx * 0.8 + (cos * (pen * asteroidToPlanetBounciness));
                _this.vy = _this.vy * 0.8 + (sin * (pen * asteroidToPlanetBounciness));
            }
        }

        d_x = -this.x + (this.x + this.vx);
        d_y = -this.y + (this.y + this.vy);

        vdist = Math.sqrt(d_x * d_x + d_y * d_y);

        this.cos = d_x / vdist;
        this.sin = d_y / vdist;
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        return true;
    }


    run(world) {
        var vdist, d_x, d_y, tan, cos, sin, force_grav, _this, len, elem, a, pen

        _this = this

        len = world.entities.length
        elem = world.entities

        /* Asteroids motion.*/
        for (var i = 0; i < len; i++) {
            let el = elem[i]
            if(el == undefined || el instanceof Planet){
                continue
            }

            a = _this.r + el.r;
            let did = screenWrap.perform(el)
            if(did) {
                continue;
            }

            /* Boundry death */
            // if(el.x < 0
            //     || el.y < 0
            //     || el.x > 800
            //     || el.y > 800) {
            //     el.x = galaxy.plotRand(800)
            //     el.y = galaxy.plotRand(600)
            //     el.vx *= .5
            //     el.vy *= .5
            //     continue
            // }

            vdist = Utils.dist(_this, el)

            if (vdist == 0 || vdist >= a * grabStrength) {
                continue
            }


            /* Asteroid to asteroid impact.*/
            pen = vdist - a
            cos = (-_this.x + el.x) / vdist
            sin = (-_this.y + el.y) / vdist
            _this.vx = _this.vx * 0.5 + cos * (pen * asteroidToAsteroidBounciness)
            _this.vy = _this.vy * 0.5 + sin * (pen * asteroidToAsteroidBounciness)
        }

        let startIndex = this.index + 1
        // len = startIndex + 1


        /* Planet gravities. */
        // for (var i=startIndex; i < len; i++) {
        for (var i = 0; i < len; i++) {
            if (elem[i] == undefined
                // || elem[i] instanceof Asteroid
                ) {
                continue
            }

            vdist = Utils.dist(_this, elem[i])
            if (vdist == 0) {
                continue
            }


            d_x = -_this.x + elem[i].x;
            d_y = -_this.y + elem[i].y;
            cos = d_x / vdist;
            pen = vdist - (_this.r + elem[i].r);

            sin = d_y / vdist;
            force_grav = world.g * (_this.m * elem[i].m) / Math.pow(vdist, 2);

            _this.vx = clamp(_this.vx + cos * discoveryEagerness * force_grav, clampMin, clampMax);
            _this.vy = clamp(_this.vy + sin * discoveryEagerness * force_grav, clampMin, clampMax);

            if (pen < 0) {
                _this.vx = _this.vx * 0.8 + (cos * (pen * asteroidToPlanetBounciness));
                _this.vy = _this.vy * 0.8 + (sin * (pen * asteroidToPlanetBounciness));
            }
        }

        d_x = -this.x + (this.x + this.vx);
        d_y = -this.y + (this.y + this.vy);

        vdist = Math.sqrt(d_x * d_x + d_y * d_y);

        this.cos = d_x / vdist;
        this.sin = d_y / vdist;
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        return true;
    }

}


galaxy = new World;

class MainStage extends Stage {
    canvas='playspace'
    mounted(){
        screenWrap = new ScreenWrap([10,10], [800,800])
        galaxy.init(this.canvas);
        // this.dragging.add(...galaxy.entities)
    }

    draw(ctx) {
        this.clear(ctx)
        galaxy.loop()
    }
}

stage = MainStage.go()