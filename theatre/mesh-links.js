/*
files:
    ../point_src/math.js
    head
    ../point_src/point-content.js
    pointlist
    point
    mouse
    stage
    ../point_src/extras.js
    ../point_src/random.js
    stroke
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js


 */
const data = [
    ['a', 'b']
    , ['a', 'c']
    , ['c', 'd']
    , ['c', 'e']
]


const pointMap = new Map()

const getNamed = function(name) {
    if(pointMap.has(name)){
        return pointMap.get(name)
    }
    let leftPad = 20
    let point = new Point(
                    leftPad + random.int(300),
                    leftPad + random.int(600))
    pointMap.set(name, point)
    return point;
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.stroke = new Stroke({
            dash: [5,5]
            , color: 'grey'
            , width: 2
            , march: 1
        })

        let c = 1
        for (var i = 0; i < data.length; i++) {
            let [na, nb] = data[i];
            let pa = getNamed(na)
            let pb = getNamed(nb)
            c += c

            if(pa.iid == undefined) {
                pa.iid = i + c
            }

            if(pb.iid == undefined) {
                pb.iid = i + c + .5
            }
        }

        this.dragging.add(...pointMap.values())
    }

    draw(ctx){
        this.clear(ctx)

        pointMap.forEach((e,i,a)=>{
            e.pen.indicator(ctx, { color: 'green', width: 1})
        })

        // this.drawConnections(ctx)
        this.drawEvery(ctx)
        let mousePoint = Point.mouse.position
        mousePoint.pen.indicator(ctx, { color: 'green', width: 3})

        this.stroke.step(.1)
    }

    drawConnections(ctx) {

        let s = this.stroke
        s.set(ctx)

        for (var i = 0; i < data.length; i++) {
            let [na, nb] = data[i];
            let pa = getNamed(na)
            let pb = getNamed(nb)
            pa.pen.line(ctx, pb)
        }

        s.unset(ctx)
    }

    drawEvery(ctx) {
        /*
        Draw A line from A to B for every point.
        Draw B to A if A to B does not exist.
         */
        let s = this.stroke
        s.set(ctx)
        let points = PointList.from(pointMap.values())
        points.everyEvery((a,b)=> a.pen.line(ctx, b));
        s.unset(ctx)
    }
}


stage = MainStage.go()
