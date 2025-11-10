/*
title: Apple Motion Timing Curve
categories: brownian
    random
---


files:
    head
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js


---


The stepMotion function:

```js
(t)=>stepMotion(t, .01, 0.5, .6, 8)
```
+ **t**: time delta: 0-1
+ anticipation: `.1`
+ midpoint: `.5`
+ oscilation: `.1`
+ damping: `.001`

---

An implementation of https://jcgt.org/published/0011/03/02/paper.pdf


    // KinematicTimingCurve.c

    // Smooth timing curve value
    float Xs(float t, float ta, float tmid) {
        float tam = ta - tmid - tmid; // ta - 2tmid

        float xa = (2.0*t*(ta - t) / (ta*tmid + tam));
        float xd = ((t - 2.0)*t*tam + (ta - 2.0)*tmid*tmid);
        xd /= ((tmid-1.0)*(ta*tmid + tam));

        return t<tmid ? xa : xd;
    }

    // Overshoot timing curve value
    float Xo(float t, float ta, float tmid, float B) {
    // terms independent of t: can be precomputed
        float tma = tmid - ta;
        float td = 1.0 - tmid;
        float amp = td*(tmid + tma)/(tmid*tma*B*M_PI);

    // time-dependent terms
        float xa = t*(t - ta) / (tmid*tma);

    // really only needed if t>tmid
        float xd = amp * sin(B*M_PI*(t - tmid)/td);
        xd *= exp(-(t - tmid)*(B/(4.0*td)));
        xd += 1.0;
        return t<tmid ? xa : xd;
    }

    // Timing curve with anticipation ta, midpoint tmid, and bounces B
    float KinematicTiming(float t, float ta, float tmid, int B) {
        return B>=1 ? Xo(t,ta,tmid,float(B)) : Xs(t,ta,tmid);
    }

*/

// class MainStage extends Stage {
//     canvas = 'playspace'
//     updateSpeed = 10
//     mounted(){
//         this.point = new Point()

//     }

//     draw(ctx) {
//         this.clear(ctx)
//         this.point.pen.fill(ctx, '#ddd')
//     }
// }

// stage = MainStage.go(/*{ loop: true }*/)



/* Apple Paper
*/

// // Smooth timing curve value
// const Xs = function(t, ta, tmid) {
//     let tam = ta - tmid - tmid; // ta - 2tmid

//     let xa = (2.0*t*(ta - t) / (ta*tmid + tam));
//     let xd = ((t - 2.0)*t*tam + (ta - 2.0)*tmid*tmid);
//     xd /= ((tmid-1.0)*(ta*tmid + tam));

//     return t<tmid ? xa : xd;
// }

// // Overshoot timing curve value
// const Xo = function(t, ta, tmid, B) {
//     // terms independent of t: can be precomputed
//     let tma = tmid - ta
//         , td = 1.0 - tmid
//         , amp = td*(tmid + tma)/(tmid*tma*B*M_PI)
//         ;

//     // time-dependent terms
//     let xa = t*(t - ta) / (tmid*tma);

//     // really only needed if t>tmid
//     let xd = amp * sin(B*M_PI*(t - tmid)/td);
//     xd *= exp(-(t - tmid)*(B/(4.0*td)));
//     xd += 1.0;
//     return t<tmid ? xa : xd;
// }

// // Timing curve with anticipation ta, midpoint tmid, and bounces B
// const KinematicTiming = function(t, ta, tmid, B) {
//     return B>=1 ? Xo(t,ta,tmid, Number(B)) : Xs(t,ta,tmid);
// }


/* other: https://www.davepagurek.com/blog/easing-functions/ */


// Smooth timing curve value
function Xs(t, ta, tmid) {
    const tam = ta - tmid - tmid; // ta - 2tmid
    const xa = (2.0 * t * (ta - t)) / (ta * tmid + tam);
    let xd = (t - 2.0) * t * tam + (ta - 2.0) * tmid * tmid;
    xd /= (tmid - 1.0) * (ta * tmid + tam);
    return t < tmid ? xa : xd;
}


// Overshoot timing curve value
function Xo(t, ta, tmid, B, k) {
    // Terms independent of t: can be precomputed
    const tma = tmid - ta;
    const td = 1.0 - tmid;
    // Time-dependent part
    if (t < tmid) {
        return (t * (t - ta)) / (tmid * tma);
    }
    const PI = Math.PI
    const sin = Math.sin
    const exp = Math.exp
    // amp can be precomputed
    const amp = (td * (tmid + tma)) / (tmid * tma * B * PI);
    let xd = amp * sin((B * PI * (t - tmid)) / td);
    xd *= exp(-k * (t - tmid) * (B / (4.0 * td)));
    xd += 1.0;
    return xd;
}


// Timing curve with anticipation, ta, midpoint, tmid, and bounces, B
function KinematicTiming(t, ta, tmid, B, k) {
  return B >= 1 ? Xo(t, ta, tmid, B, k) : Xs(t, ta, tmid);
}


const createSlider = function(stage, label, min, max, init, step) {
    /*
     taSlider = createSlider(0, 0.5, 0, 0.001)
     tMidSlider = createSlider(0.2, 0.8, 0.5, 0.001)
     bSlider = createSlider(0, 5, 2, 1)
     kSlider = createSlider(4, 10, 5, 0.001)
    */

    return addControl('updateSpeed', {
        field: 'range'
        , label
        , step
        , min
        , max
        , stage
        , onchange(ev) {
            /*slider changed. */
            let sval = ev.currentTarget.value
        }
    })
}


let stepMotion = function(t, anticipation=.1, midpoint=.5, oscilation=.1, damping=.001) {
    /*
     anticipation = createSlider(0, 0.5, 0, 0.001)
     midpoint = createSlider(0.2, 0.8, 0.5, 0.001)
     oscilation   = createSlider(0, 5, 2, 1)
     damping      = createSlider(4, 10, 5, 0.001)
    */

    return KinematicTiming(t, anticipation, midpoint, oscilation, damping)
}
