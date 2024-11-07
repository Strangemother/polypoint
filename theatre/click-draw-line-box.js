const twoPointBox = function(a, b, func) {
    let asLine = func || function(c, d) {
        let l = new Line(c, d)
        l.doTips = false
        return l;
    }

    return [
          // x top
          asLine([a.x, a.y], [b.x, a.y])
          // y left
        , asLine([a.x, a.y], [a.x, b.y])
        // x bottom
        , asLine([a.x, b.y], [b.x, b.y])
        // y right
        , asLine([b.x, a.y], [b.x, b.y])
    ]
}



const disorderdTwoPointsAsRect = function(a, b) {

    return [
          // x top
          {x: a.x, y: a.y}, {x: b.x, y: a.y}
          // y left
        , {x: a.x, y: a.y}, {x: a.x, y: b.y}
        // x bottom
        , {x: a.x, y: b.y}, {x: b.x, y: b.y}
        // y right
        , {x: b.x, y: a.y}, {x: b.x, y: b.y}
    ]
}


const twoPointsAsRectOrdered = function(a, b) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    return [
        { x: minX, y: minY }, // Bottom-left corner
        { x: maxX, y: minY }, // Bottom-right corner
        { x: maxX, y: maxY }, // Top-right corner
        { x: minX, y: maxY }  // Top-left corner
    ];
}




// const asDimensions = function() {

//     return {
//         "x": 0,
//         "y": 0,
//         "width": 1394.09375,
//         "height": 698.046875,
//         "top": 0,
//         "right": 1394.09375,
//         "bottom": 698.046875,
//         "left": 0
//     }

// }


/*
Hello GPT, I am working on my Polypoint library, a JS library dedicated to 2D points.
I would like to make a JS function of which accepts a single point, and a list of other points,
And the function should check if the given single point exists within the the polyon of the _other_ points.

For example:

    let othersBox = [
        new Point(200, 200)
        , new Point(200, 500)
        , new Point(500, 500)
        , new Point(500, 200)
    ]
    let result = withinBox(new Point(300, 500), othersBox)
    console.log(result == true)

This should work with any number of points, from 3 (for a triangle), this example shows 4.
But it should also work with 4+ points.

May I ask if you can show me the function to produce this?*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.lines = []
        this.drawing = false
        this.events.wake()
        this.points = PointList.generate.random(100, [800, 600], {x: 100, y: 100})
        this.stroke = new Stroke({
            color: '#5555FF'
            , width: 1
            , dash: [1]
        })

        this.selected = new Set
        this.mouse.point.radius = 20
    }

    onClick(ev) {
    }

    onDblclick(ev) {

    }

    onMousedown(ev) {
        this.drawing = true
        this.downPoint = Point.from(ev)
        // this.selectItems()
    }

    onMouseup(ev) {
        this.drawing = false
        this.upPoint = Point.from(ev)
        // this.lines = []
    }

    onMousemove(ev) {
        if(!this.drawing) {
            return
        }

        /* render the concurrent box from downPoint to mousePoint*/
        let dp = this.downPoint
        let mp = this.mouse.point
        this.lines = twoPointBox(dp, mp)
        this.selectItems(dp, mp)
    }

    selectItems(a,b){
        let rect = twoPointsAsRectOrdered(a,b)
        let keep = new Set;

        let handList = new PointList(...rect)
        this.points.forEach((p)=>{
            let within = withinPolygon(p , rect)
            if(within) {
                keep.add(p.uuid)
                // handList.push(p)
            }
        })
        this.selected = keep
        let handle = undefined
        if(keep.size > 1){
            handle = handList.centerOfMass()
        }
        this.handle = handle
        return keep
    }

    draw(ctx){
        this.clear(ctx)

        let ps = this.points;
        ps.forEach((p)=>{
            let selected = this.selected.has(p.uuid)
            p.pen.fill(ctx, selected? 'green':'#880000')
        })

        if(this.downPoint && this.upPoint){

            // let mouseOver = withinPolygon(
            //                 this.mouse.point
            //                 , twoPointsAsRectOrdered(this.downPoint, this.upPoint)
            //             )
            let mouseOver = this.mouse.point.within.polygon(
                    twoPointsAsRectOrdered(this.downPoint, this.upPoint)
                )
            if(mouseOver) {
                this.mouse.point.pen.circle(ctx)
            }

            this.handle?.pen.fill(ctx, '#ddd')
        }

        this.stroke.set(ctx)
        this.lines.forEach(l=>l.render(ctx))
        this.stroke.unset(ctx)


    }
}

stage = MainStage.go()
