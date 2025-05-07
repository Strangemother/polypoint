/*
title: JSON Save Restore
categories: json
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
---

We can convert a `Point` or `PointList` to JSON.
Any pointlist will cast and parse from a string:

    const strPoints = points.toJSON()
    `[
        [250,150,10,270],
        [450,520,8,270]
    ]`
    points.fromJSON(stringPoints)

In this example, any change is written to `localStorage`.
Refreshing the page will restore the previous changes.
A JSON dump of `stage.points` exists in `localStorage["polypoint-json-example"]`

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.restoreJSON()

        if(this.points == undefined) {
            this.points = new PointList(
                new Point({
                     x: 250, y: 150
                    , radius: 10
                    , vx: 1, vy: 0
                    , mass: 2
                })
                , new Point({
                     x: 400, y: 320
                    , vx: -1, vy: 0
                    , radius: 20
                    , mass: 10
                })
                , new Point({
                     x: 200, y: 320
                    , vx: .4, vy: -.1
                    , radius: 10
                    , mass: 8
                })
                , new Point({
                     x: 110, y: 220
                    , vx: .4, vy: -.1
                    , radius: 8
                    , mass: 8
                })
                , new Point({
                     x: 230, y: 120
                    , vx: .4, vy: -.1
                    , radius: 22
                    , mass: 8
                })
                , new Point({
                     x: 450, y: 520
                    , vx: .4, vy: -.1
                    , radius: 8
                    , mass: 8
                })
            )
        }

        this.dragging.add(...this.points)
        let d = this.saveButton = {
            label: "Save JSON"
            , onclick: (ev, proxySelf) =>{
                console.log('Save')
                this.saveJSON()
            }

        }
        addButton('save', d)

        addButton('restore', {
            label: "Restore JSON"
            , onclick: (ev, proxySelf) =>{
                console.log('restore')
                this.restoreJSON()
            }

        })
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.indicators(ctx)
    }

    restoreJSON() {
        let d = localStorage['polypoint-json-example']
        if(d) {
            let loadedPoints = PointList.fromJSON(d)
            this.points = loadedPoints
            this.dragging.set(...this.points)
        }
    }

    onMouseup(ev) {

        // clearTimeout(this._saveTimer)
        // this._saveTimer = setTimeout(this.saveJSON.bind(this), 1000)
    }

    saveJSON() {
        /*
        create the JSON of the polypoints
        and store to localstorage
         */
        let text = this.points.toJSON()
        let key = 'polypoint-json-example';
        localStorage[key] = text
        console.log(text.length, 'chars written to', key)
        return text
    }
}


Polypoint.head.installFunctions('Point', {
    toJSON() {
        /* By default the Point.toJSON return the array value. */
        return this.asArray()
    }
})


Polypoint.head.installFunctions('PointList', {
    toJSON() {
        // console.log('Store to JSON', this)
        let output = []
        this.forEach((p)=>{
            let d = p.toJSON()
            output.push(d)
        })
        return JSON.stringify(output)
    }

    , fromJSON(text) {
        let output = JSON.parse(text)
        return PointList.from(output).cast()
    }
})


Polypoint.head.staticFunctions('PointList', {
    fromJSON(text) {
        let output = JSON.parse(text)
        return PointList.from(output).cast()
    }
})


stage = MainStage.go(/*{ loop: true }*/)
