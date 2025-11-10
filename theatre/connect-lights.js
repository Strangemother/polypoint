/*
title: Connected Light Points Grid
categories: minimal
files:
    head
    point
    pointlist
    ../point_src/events.js
    mouse
    stage
    dragging
    stroke
    ../point_src/random.js
    ../point_src/rectangle.js
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/
class MainStage extends Stage {
    canvas = 'playspace'

    constantClick = true
    mounted() {

        this.points = PointList.generate.random(8, new Point(500, 500, 30), new Point(100, 100))
        this.points = PointList.generate.grid(40, 7, 110)
        this.points.each.radius = ()=> random.int(5,15)
        // this.point = this.points[2].copy()
        // this.point.radius = 30
        random.shuffle(this.points, 2)
        this.dragging.add(...this.points)
        this.action = 'connectStart'
        this.connections = {}
    }

    onclick(ev) {
        console.log('click', this.dragging._near)
        this[this.action](ev, this.dragging._near)
    }

    connectStart(ev, p) {
        if(p == undefined) { return }
        this.start = p
        this.action = 'connectEnd'
        console.log('started')
    }

    connectEnd(ev, p) {
        if(p == undefined) { return }

        if(p == this.start) {
            // turn off
            this.start = undefined
            this.action = 'connectStart'
            return
        }

        let uuid1 = this.start.uuid
        let uuid2 = p.uuid
        console.log('stopped')
        let name = `${uuid1}-${uuid2}`
        if(this.connections[name] == undefined){
            // create
            this.connections[name] = []
            console.log('Creating')
        }

        this.connections[name].push([this.start, p])
        this.start = undefined
        this.action = 'connectStart'

        if(this.constantClick) {
            this.start = p
            this.action = 'connectEnd'
        }
    }

    draw(ctx){
        this.clear(ctx)
        // this.points.pen.rect(ctx,{width: 4, color: '#444'})
        for(let k in this.connections) {
            this.connections[k].forEach(v=>{
                v[0].pen.line(ctx, v[1], '#888', 3)
            })
        }

        this.points.pen.fill(ctx, {color:'purple'})

        if(this.action == 'connectEnd') {
            this.start.pen.line(ctx, this.mouse.point, '#888', 3)
        }
        if(this.start) {
            this.start.pen.fill(ctx, {color:'green'})
        }
    }
}


stage = MainStage.go(/*{ loop: true }*/)

