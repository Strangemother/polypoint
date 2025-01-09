/*

files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/random.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/automouse.js


*/

class Stack {
    /*


    let st = new Stack()
    let one = st.add('one')
    let two = st.add('two')
    let three = st.add('three')
    let four = st.add('four')

        // value == four
        console.log(st.remove(three), st.value())
        // value == four
        console.log(st.remove(one), st.value())
        // value == two
        console.log(st.remove(four), st.value())

    Useful for things like cursor stacks.

     */
    constructor() {
        this.map = new Map;
        this.keys = [];
    }
    add(data) {
        let id = random.string()
        this.map.set(id, data)
        this.keys.push(id)
        return id
    }

    value() {
        let keys = this.keys
        let _top = keys[keys.length - 1]
        return this.map.get(_top)
    }

    remove(id) {
        let data = this.map.get(id)
        this.map.delete(id)
        let keys = this.keys
        let _top = keys[keys.length - 1]

        if(_top == id) {
            // back-stack is required
            this.destack()
        }
        return data
    }

    destack(){
        // rebuild the keys list
        let map = this.map
        let res = [];
        this.keys.forEach((k)=> map.has(k) && res.push(k))
        this.keys = res
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.generate(4)
        this.dragging.addPoints(...this.points)//, ...this.la, ...this.lb)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        // this.dragging.onDragMove = this.onDragMove.bind(this)
        // this.dragging.onWheel = this.onWheel.bind(this)
    }

    generate(pointCount=3){
        /* Generate a list. In this random... */
        this.points = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.points.forEach(p => {
                p.rotation = random.int(360)
                p.radius = clamp(random.int(70), 10, 60)
            })
    }

    onDragEnd(){}

    onDragMove(){}

    onWheel(ev, p) {}

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        this.dragging.getPoint()?.pen.circle(ctx)
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        this.points.pen.indicators(ctx)
    }

}

stage = MainStage.go()