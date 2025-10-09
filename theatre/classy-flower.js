/*
title: Flower!
src_dir: ../point_src/
categories: curve
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/stage-clock.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/functions/range.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/curve-extras.js
    ../point_src/split.js
    ../point_src/gradient.js
    ../point_src/jiggle.js

---

*/

addButton('Generate', {
    onclick(){
        stage.generate()
    }
});

// const TAU = Math.PI * 2;

class Flower extends Point {
    /*
    flower = new Flower({
        // The general radius of the flower.
        radius: random.int(5, 80)
        // A count of petals.
        , count: random.int(5, 20)
        // The size of petals (Their point radius)
        , size: radius * 3 // random.int(100, 200)
    });
    flower.generate()
    flower.render(ctx)

    */

    // constructor(conf={}) {
    //     this.config = conf;
    //     this.point = conf.point || (new Point)
    // }
    init() {

        let size = this.size // random.int(100, 200)
        this.grad = this.setupGradient(this, size)

        this.lineStroke = new Stroke({
            color: '#fff'
            , width: 2
            , dash: [7, 4]
        })

        this._count = 0
        // call once
        this._time = this._time ?? 0;
        this._last = this._last ?? performance.now();

    }

    generate() {
        /* The general radius of the flower. */
        let radius = this.radius //random.int(5, 80)
        /* A count of petals. */
        let count = this.count //random.int(5, 20)
        /* The size of petals (Their point radius) */
        let size = this.size // random.int(100, 200)
        /* We copy the center point to save keystrokes. */
        let p = this.update({radius})

        /* Split on a point, returns many points around the radius. */
        this.points = p.split(count)
        this.points.each.radius = size
        this.points.each.initRadians = (p)=> p.radians

        let lines = this.lines = []
        let length = this.points.length;

        /* Generate many curves. connecting pairs. */
        for (var i = 0; i < length; i++) {
            let nextValue = i + 1;
            if(nextValue == length) {
                nextValue = 0 // wrap around.
            }
            let line = new BezierCurve(this.points[i], this.points[nextValue])
            line.doTips = false;
            lines.push(line)
        }
    }


    generateRandom() {
        this.update(this.generateRandomConfig())
        this.generate()
    }

    onDragMove(ev) {
        // console.log('grad')
        this.generate()
    }

    setupGradient(p, size) {
        var g = new Gradient(null, 'Linear', [p.add(size * .5), p.subtract(size * .5)])
        g.addStops({
            0: "hsl(244deg 71% 56%)"
            , 1: "hsl(299deg 62% 44%)"
        })
        return g
    }

    generateRandomConfig() {
        let radius = random.int(60, 80)
        let size =  radius * 3 // random.int(100, 200)
        return {
            /* The general radius of the flower. */
            radius
            /* A count of petals. */
            , count: random.int(5, 20)
            /* The size of petals (Their point radius) */
            , size
        }
    }

    step2(ctx) {
        // jiggle petals.
        this._count += 1;
        let t = this._count
        // each frame
        const A = 10 * Math.PI/180;      // Â±10Â°
        const f = 0.005;                   // slower = 0.05 Hz (20s period)
        const TAU = Math.PI * 2;

        this.lines.map(
                (x)=> x.points
            ).map(
                (pl, i)=>pl.forEach(
                    p=>{
                        // t = time in seconds (or frame count * dt)
                        // cheap smooth noise: sin of sin (swap for Perlin if you have it)
                        const phase = i * 0.5;            // per-petal offset
                        const gust = 0.4
                                    + 0.3
                                    * Math.sin(TAU * 0.02 * t + i * 1.23)
                                    * Math.sin(TAU * 0.011 * t + i * 0.37)
                                    ;

                        p.radians = p.initRadians
                                    + (A * gust)
                                    * Math.sin(TAU * f * t + phase)
                                    ;

                        // // t = time in seconds (or frame count * dt)
                        // const amplitude = 20 * Math.PI/180;   // 10Â° in radians
                        // const frequency = 0.1;                // how many cycles per second
                        // const phase = i * 0.5;                // optional: offset each petal by index
                        // p.rotation += Math.sin(t * frequency + phase) * amplitude * .04;

                    }
                )
            )
    }

    step(ctx){
      // --- real time in seconds ---
      const now = performance.now();
      const dt  = (now - this._last) / 1000;
      this._last = now;
      this._time += dt;
      const t = this._time;
      const A   = this.getAngleArc() * Math.PI/180;   // Â±10Â°
      // const f   = .2;               // 0.01 Hz = 100s period (nice and slow)
      const gust = this.getGust(t)
      this.lines
            .map(x => x.points)
            .map(
                (pl, i) => pl.forEach(p => {
                    const phase = this.phase? this.phase: (i * .8);  // per-petal offset
                    const f   = .5 // random.float(.2, .3)
                    p.radians = p.initRadians + (A * gust) * Math.sin(TAU * f * t + phase);
                })
            );
    }

    getAngleArc() {
        return 10
    }

    getGust(t=1) {
      // slooow wind (two really slow LFOs)

      const gust = 0.4
                 + 0.3
                 * Math.sin(TAU * 0.0015 * t + -1.23)   // ~333s period
                 * Math.sin(TAU * 0.05 * t - this._count); // ~666s period
        return gust
    }

    render(ctx) {

        // this.points.pen.indicator(ctx, {color: '#336600'})
        ctx.fillStyle = this.grad.getObject(ctx)

        // let lineStroke = this.lineStroke
        // lineStroke.set(ctx)

        /* In this case we don't use the l.render(ctx).
        Instead we do the .perform(ctx) method to manally
        open and close the path.

        This ensures we draw one vector object, rather than
        many smaller paths. */
        this.lines[0].start(ctx)
        this.lines.forEach((l)=>{
            // l.start(ctx);
            l.perform(ctx);
        });

        ctx.fill()

        this.lines[this.lines.length-1].close(ctx)
        // lineStroke.unset(ctx)

        /* The center point. */
        this.pen.fill(ctx, 'orange')
    }

}


class MainStage extends Stage {
    canvas='playspace'
    // live = true
    mounted(){
        this.generate()
        this.events.wake()
    }

    generate() {
        let rint = random.int;

        let generateFlower = i => {
            let radius = rint(3, 10)

            let f = new Flower({
                /* The general radius of the flower. */
                radius
                /* A count of petals. */
                , count: rint(6, 14)
                /* The size of petals (Their point radius) */
                , size: radius * random.float(2, 4)
                , x: rint(100, 700)
                , y: rint(100, 600)
                , phase: i
            });
            f.init()
            f.generate()
            return f
        }

        let radius = rint(60, 80)
        let fl = range(100).map(generateFlower)
        this.bunch = fl;
        /* Using _set_ rather than _add_, ensures we forget any old
        flowers. */
        this.dragging.setPoints(...fl)
    }

    draw(ctx){
        this.clear(ctx)
        let tick = this.clock.tick + 1
        this.bunch.forEach((f,i)=>{
            // f.jiggler.step({
            //     tick: (tick * .001 + i )
            //     , width: .1
            //     , height: .2
            //     , xSpeed: .01
            //     , ySpeed: .02
            // })
            f.step(ctx)
            // f.generate(ctx)
            f.render(ctx)
        })
    }
}

;stage = MainStage.go();