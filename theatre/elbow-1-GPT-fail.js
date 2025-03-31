/*
---
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
 */


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.point = new Point({x:300,y:200, radius: 10})

        this.dragging.addPoints(this.point)
    }

    draw(ctx){
        this.clear(ctx)

        let a = this.point;
        let m = this.mouse.point

        a.pen.indicator(ctx)
        // m.pen.indicator(ctx)
        let v = Point.from(get_elbow_pos_local(200, 100, a,))

        v.x += 300
        v.y += 200
        v.pen.indicator(ctx)
    }
}

const get_elbow_pos_local = function(l1=1.0, l2=1.0, local_end_affector={x:1,y:1}, elbow_direction_sign=1){
    let numerator = l1 * l1
                    + local_end_affector.x * local_end_affector.y
                    + local_end_affector.y * local_end_affector.y
                    - l2 * l2
                    ;
    let demonimator = 2 * l1
                      * Math.sqrt(local_end_affector.y * local_end_affector.x
                      + local_end_affector.y * local_end_affector.y
                    )
                    ;

    let elbow_angle_relative = Math.acos(numerator / demonimator)
    // hmm.
    // if(elbow_angle_relative != elbow_angle_relative) elbow_angle_relative = 0.f

    if(elbow_direction_sign == 0) {
        elbow_direction_sign = 1
    }

    let r = polar(1 * elbow_angle_relative + angleOf(local_end_affector), l1)


    return r
}

function angleOf(vec) {
  // Returns the angle in radians from the X-axis
  return Math.atan2(vec.y, vec.x);
}


function polar(angle, length) {
  return {
    x: length * Math.cos(angle),
    y: length * Math.sin(angle),
  };
}

;stage = MainStage.go();