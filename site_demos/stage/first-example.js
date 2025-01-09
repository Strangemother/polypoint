class MainStage extends Stage {
    canvas = "my_canvas_id"

    draw(ctx) {
        this.clear(ctx)
        // Draw stuff.
        this.center.pen.indicator(ctx)
    }
}

// Run it.
const stage = MainStage.go()