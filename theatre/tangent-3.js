/*
title: Tangent Lines: Top and Bottom
categories: tangents
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/tangents.js
 */

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.a = new Point(200, 200, 90)
        this.b = new Point(600, 200, 100)
        this.dragging.add(this.a, this.b)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.updateTangents()
    }

    updateTangents() {
        this.updateOuterTangents()
        this.updateCrossTangents()
    }

    updateCrossTangents() {
        const lines = this.a.tangent.crossLines(this.b)
        if (!lines) {
            this.crossTopTangent = undefined
            this.crossBottomTangent = undefined
            return
        }

        this.crossTopTangent = PointList.from(lines.a).cast()
        this.crossBottomTangent = PointList.from(lines.b).cast()
    }

    updateOuterTangents() {
        const lines = this.a.tangent.outerLines(this.b)
        if (!lines) {
            this.topTangent = undefined
            this.bottomTangent = undefined
            return
        }

        this.topTangent = PointList.from(lines.a).cast()
        this.bottomTangent = PointList.from(lines.b).cast()
    }

    onDragMove() {
        this.updateTangents()
    }

    draw(ctx) {
        this.clear(ctx)
        this.a.pen.circle(ctx, undefined, 'green', 2)
        this.b.pen.circle(ctx, undefined, 'green', 2)
        this.topTangent?.pen.line(ctx, { color: '#4433DD', width: 2 })
        this.bottomTangent?.pen.line(ctx, { color: '#DD6688', width: 2 })
        this.crossTopTangent?.pen.line(ctx, { color: '#33AA33', width: 2 })
        this.crossBottomTangent?.pen.line(ctx, { color: '#AA33AA', width: 2 })
    }
}

stage = MainStage.go()
