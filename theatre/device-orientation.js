/*
title: Device Orientation
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/pointlist.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/text/beta.js

 */
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(200, 100, 20)
        this.orientation = {spin: 0, pitch: 0, roll: 0}
    }

    draw(ctx){
        this.clear(ctx)

        ctx.fillStyle = '#DDD'
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        this.point.text.fill(ctx, JSON.stringify(this.orientation))
        // this.point.pen.fill(ctx, '#880000')
    }
}


const sensor = new AbsoluteOrientationSensor();
Promise.all([navigator.permissions.query({ name: "accelerometer" }),
             navigator.permissions.query({ name: "magnetometer" }),
             navigator.permissions.query({ name: "gyroscope" })])
       .then(results => {
         if (results.every(result => result.state === "granted")) {
           sensor.start();

         } else {
           console.log("No permissions to use AbsoluteOrientationSensor.");
         }
   });

window.addEventListener('deviceorientation', handleOrientation);

let ticks = 0;


function handleOrientation(event) {
    const spin = alpha = event.alpha; // flat on its back
    const pitch = beta = event.beta; // pitch forward
    const roll = gamma = event.gamma; // roll
    // Do stuff...
    ticks++
    // console.log(spin, pitch, roll, )
    stage.orientation = {ticks, spin, pitch}
}


stage = MainStage.go(/*{ loop: true }*/);