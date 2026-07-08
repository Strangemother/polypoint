// frame looper
const anim = new Anim()

// Global store
const system = new System()

let autoMain = function(){
    setup()
    system.run()
}


const setup = function(){

    system.layers.add(new Triangle({
        position: new Point(10, 50)
        , color: 'orange'
    }))

    system.layers.add(new PointCurve({
        position: new Point(120, 150)
        , points: [
            point(0, 0),
            point(10, 10),
            point(-5, 20),
            point(10, 30),
            point(5, 40),
        ]
    }))

    system.layers.add(new Triangle({
        position: new Point(120, 150)
        , color: 'pink'
    }))


    system.layers.add(new Triangle({
        position: new Point(160, 300)
        , color: 'white'
    }))
}


class Triangle extends Drawable {
    /*
        ctx.save();
        ctx.translate(x, y);
        // Adjust the rotation to align the forward direction
        ctx.rotate(angle + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(0, -size); // Top point
        ctx.lineTo(size, size); // Bottom right point
        ctx.lineTo(-size, size); // Bottom left point
        ctx.closePath();

        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.restore();
    */
    options() {
        return {
            size: 5
            , position: point(50, 50)
            , rotation: 1
            , lineWidth: 2
            , color: 'green'
        }
    }

    setup() {
        let d = this.data
        system.keys.down('ArrowLeft', ()=>d['rotation'] -= .1)
        system.keys.down('ArrowRight', ()=>d['rotation'] += .1)
        system.keys.down('ArrowUp', ()=>d['position'][1] += 1 )
    }

    render(ctxW) {
        // console.log('.')
        let d = this.data;
        let ctx = ctxW.ctx
        let p = d.position

        system.wrappers.saveRestore(ctx, ()=>{
            // system.wrappers.lineWidth(ctx, d.lineWidth, ()=>{
                // ctxW.wrappers.colorStroke(ctx, d.color, ()=> {
                system.tools.eqTriangle(ctxW, p[0], p[1], d.size, d['rotation'], d.color)
                // })
            // })
        })

    }
}


class PointCurve extends Drawable {

    options() {
        return {
            foo: 'bar'
            , lineWidth: 5
            , position: new Point(102, 102)
            , points: [
                point(0, 0),
                point(10, 10),
                point(-5, 20),
                point(10, 30),
                point(5, 40),
            ]
            , color: 'yellow'
        }
    }

    render(cw) {
        let ctx = cw.ctx
        let d = this.data
        let p = d.position
            ctx.lineWidth = 1
        cw.saveRestore(ctx, (ctxW)=>{
            // system.wrappers.lineWidth(ctx, d.lineWidth, ()=>{
                ctx.translate(p[0], p[1])
                ctx.lineWidth = d.lineWidth
                // ctx.lineWidth = 5
                cw.wrappers.colorStroke(ctx, d.color, ()=> {
                    cw.pen.quadraticLine(d.points)
                })
                // ctx.closePath()
            // })
        })
    }
}

;autoMain();