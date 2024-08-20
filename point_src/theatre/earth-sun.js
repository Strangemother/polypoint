const arcLine = function(ctx, points) {
    ctx.beginPath();
    // midPoint.pen.indicator(ctx)

    let startPoint = points[0]

    ctx.moveTo(startPoint.x, startPoint.y);

    let previousPoint = startPoint;
    let pl = points.length;

    // debugger;
    for (var i = 0; i < pl; i++) {
        let p = points[i]
        // if(previousPoint) {
            // if(i == pl-1) {
                // end point
                // ctx.lineTo(p.x, p.y);
            // } else {
                let toPoint = p;
                let r = previousPoint.radius
                ctx.arcTo(previousPoint.x, previousPoint.y, toPoint.x, toPoint.y, r);
            // }
        // }
        previousPoint = p
        // this.drawArc(ctx, midPoint, pointC, pointD)
    }
    let last = points[pl-1]
    ctx.lineTo(last.x, last.y);

    // ctx.stroke();
}





/*





Mercury #1a1a1a Yes it is really that dark

Venus #e6e6e6 or perhaps a bit darker

Earth tricky as it is a mix of colors, and changes over the yea
r seems to average out as about #2f6a69

Mars #993d00

Jupiter #b07f35

Saturn #b08f36

Uranus #5580aa

Neptune #366896
const planetColors = [
    { planet: "Mercury", color: "#918E85" },
    { planet: "Venus", color: "#EEDDAA" },
    { planet: "Earth", color: "#7EC8E3" },
    { planet: "Mars", color: "#D14A28" },
    { planet: "Jupiter", color: "#C6906E" },
    { planet: "Saturn", color: "#D9C48B" },
    { planet: "Uranus", color: "#7FD1B9" },
    { planet: "Neptune", color: "#2C4D97" },
    { planet: "Pluto", color: "#B2A393" }
];



 */
const planets = [
    {
        color: "yellow"
        , diameter: 1_391_400 // km
        , name: 'Sun'
        , au: 0
        , radius: 400
    },
    {
        color: "#4DA6FF",
        'name': 'Earth',
        au: 1,
        diameter: 12_756,
        km: 149_600_000
    }
]



class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        this.multiplier = 1
        // this.point = new Point(50, 50)
        const r = 200
        const shareSize = 15
        this.near = this.center.copy()

        this.generatePlanetList()

        // this.dis = new Distances
        // this.dis.addPoints(this.center, this.point0, this.point1)
        this.dis = new Dragging
        this.dis.initDragging(this)
        // this.dis.onDragMove = this.onDragMove.bind(this)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(...this.points)
    }

    generatePlanetList(){
        let offset = new Point({x: 50, y:0})
        let origin = new Point({x: 150, y:150})
        let pl = Object.keys(planets).length
        this.points = asPoints(planets)
        this.setEarth(this.points)
    }

    setEarth(ps=this.points) {

        let [sun, earth] = [ps[0], ps[1]]
        const earthScaledRadius = (earth.diameter / sun.diameter) * sun.radius;
        earth.radius = earthScaledRadius
    }

    draw(ctx){
        this.clear(ctx)
        this.drawCircles(ctx)
        this.drawIris(ctx)
    }

    drawCircles(ctx) {
        // this.points.pen.indicators(ctx)
        this.points.pen.fill(ctx)
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    // onDragMove(ev) {
    //     this.dis.applyXY(ev.x, ev.y)
    // }
}


; stage = MainStage.go();