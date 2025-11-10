/*
title: Radial Sun Ray Effect
files:
    ../point_src/core/head.js
    ../point_src/pointlistpen.js
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
    ../point_src/bisector.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/rotate.js
    ../point_src/stage.js
    ../point_src/gradient.js
    ../point_src/json.js
    ../point_src/text/alpha.js
    ../point_src/text/label.js
 */

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

const settings = {
    zoom: .0006
    // Pixel distance per planet
    // if sun AU is not a factor
    // , distanceMultiplier: 150

    // if au is a factor
    , distanceMultiplier: .16

}

const planets = {
    Sun: {
        color: "yellow",
        // color: "yellow",
        diameter: 1_391_400
        , au: 0
        // , radius: 30
        // Each pixel is equal to 13,914KM
        // , radius: 100
        //      sun.diameter / sun.radius
    },
    Mercury: {
        color: "#A8A9AD",
        diameter: 4_879,
        km: 57_900_000,
        au: 0.39
    },
    // Venus: {
    //     color: "#F5C26B",
    //     diameter: 12_104,
    //     au: 0.72,
    //     km: 108_200_000
    // },
    // Earth: {
    //     color: "#4DA6FF",
    //     au: 1,
    //     diameter: 12_756,
    //     km: 149_600_000
    // },
    // Mars: {
    //     color: "#FF5733",
    //     diameter: 6_792,
    //     km: 227_900_000,
    //     au: 1.52
    // },
    // Jupiter: {
    //     color: "#D98B4F",
    //     diameter: 142_984,
    //     au: 5.2,
    //     km: 778_600_000
    // },
    // Saturn: {
    //     color: "#E6C56A",
    //     au: 9.54,
    //     diameter: 120_536,
    //     km: 1_433_500_000
    // },
    // Uranus: {
    //     color: "#63E8E2",
    //     au: 19.2,
    //     diameter: 51_118,
    //     km: 2_872_500_000
    // },
    // Neptune: {
    //     // color: "#3C67DE",
    //     color: "#aad7e8",
    //     au: 30.06,
    //     diameter: 49_528,
    //     km: 4_495_100_000
    // },
    // Pluto: {
    //         color: "#C4A484"
    //     , au: 37
    //     , diameter: 9_528
    //     , km: 5_906_376_272
    //     , max_km: 7_375_100_000
    // }
}


class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        this.multiplier = 150
        // this.point = new Point(50, 50)
        const r = 200
        const shareSize = 15
        this.near = this.center.copy()
        this.generatePlanetList()

        this.dis = new Dragging
        this.dis.initDragging(this)
        this.dis.addPoints(...this.points)

        let sun = this.points.getByName('Sun')
        this.g = (new Gradient).radial(sun)

        let c1 = '#fbc148'
        let c2 = '#d64b02'

        this.g.addStops({
            0: {color: c1}
            , 1: {color: c2} // dark
            // ,1: {color: '#c31a01'} // dark
        })

        this.moveSun(sun)
    }

    moveSun(sun){
        if(sun == undefined) {
            sun = this.points.getByName('Sun')
        }
        sun.x = sun.radius * -.66
        sun.y = this.center.y
        this.applySunGrad()
    }

    generatePlanetList(){
        let offset = new Point({x: 50, y:0})
        let origin = new Point({x: 100, y:100})
        let pl = Object.keys(planets).length
        this.points = PointList.generate.list(pl, offset, origin);
        this.makePlanets(this.points, settings.distanceMultiplier, 10)
    }

    makePlanets(points, multiplier=2, offset=0) {
        /* Here we perform a _firstpass_ to add info to the points and planets.*/
        let ps = points || this.points;
        let centerY = this.center.y
        /* install sizes and positions.*/
        let names = Object.keys(planets)
        let sun = ps.getByName('Sun')
        let km = .000001//(sun.diameter / sun.radius) * .1;

        for (var i = 0; i < names.length; i++) {
            let mul = i==0?1:multiplier
            let name = names[i]
            let info = planets[name]
            info.name = name;
            info.index = i
            let sunOffsetKM = i==0? 1: info.km * km
            // info.x = (offset + (i * mul))
            info.x = (offset + sunOffsetKM * mul)
            info.y = centerY
            info.radius = (info.diameter * settings.zoom)
            ps[i].update(info)
        }
    }

    draw(ctx){
        this.clear(ctx, '#000')
        // arcLine(ctx, this.points)
        // bisectAll(this.points)
        // ctx.stroke();
        this.points.pen.fill(ctx)
    }

    applySunGrad(){
        let sun = this.points.getByName('Sun')
        this.g.radial() // refresh hack.
        let grad = this.g.getObject(this.ctx)
        sun.color = grad
        // this.perspectiveCenter.pen.fill(ctx, '#880000')
    }


    // onDragMove(ev) {
    //     this.dis.applyXY(ev.x, ev.y)
    // }
}


;stage = MainStage.go();