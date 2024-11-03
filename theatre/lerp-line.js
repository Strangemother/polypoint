

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.indicator = new Point({x: 300, y: 300}); // Start the draggable point somewhere
        this.a = new Point({x: 100, y: 100});
        this.b = new Point({x: 500, y: 500});

        this.dragging.add(this.a, this.b)
        this.line = new Line(this.a, this.b);

        this.stroke = new Stroke({
            color: '#eee',
            width: 1,
            dash: [7, 4]
        });

        this.events.wake();
    }

    onMousemove(ev) {
        let p = this.mouse.point;

        // Project p onto the line formed by points a and b
        let ab = { x: this.b.x - this.a.x, y: this.b.y - this.a.y };
        let ap = { x: p.x - this.a.x, y: p.y - this.a.y };
        let abLengthSq = ab.x * ab.x + ab.y * ab.y;
        let t = (ap.x * ab.x + ap.y * ab.y) / abLengthSq; // Projection factor

        // Clamp t between 0 and 1 to restrict within line segment
        t = Math.max(0, Math.min(1, t));

        // Update the draggable point to the projection on the line
        this.indicator.x = this.a.x + t * ab.x;
        this.indicator.y = this.a.y + t * ab.y;


    }

    draw(ctx) {
        this.clear(ctx);

        // Draw the line
        this.stroke.set(ctx);
        this.line.render(ctx, { color: '#90000' });
        this.stroke.unset(ctx);

        // Draw the draggable point along the line
        this.indicator?.pen.fill(ctx, 'green');
    }
}


class xMainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.indicator = undefined
        let a = new Point({x:100, y:100})
        let b = new Point({x:500, y:500})

        this.dragging.add(a,b)
        this.line = new Line(a,b)


        this.stroke = new Stroke({
            color: '#eee'
            , width: 1
            , dash: [7, 4]
        })

        this.events.wake()
    }

    onMousemove(ev) {
        let p = this.mouse.point
        this.indicator = p;
    }

    draw(ctx){
        this.clear(ctx)

        this.stroke.set(ctx)
        this.line.render(ctx, {color: '#90000'})
        this.stroke.unset(ctx)

        this.indicator?.pen.fill(ctx, 'green')

    }
}

stage = MainStage.go()
