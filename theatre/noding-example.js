
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.stroke = new Stroke({
            color: '#33aaFF'
            , width: 3
            , dash: [5, 5]
            , march: .1
        })

        let pts = PointList.generate.random(5, [600, 400], {x:100, y:100})
        pts.each.radius = 40
        pts.each.rotation = 0

        this.points = pts
        this.dragging.add(...pts)
    }

    draw(ctx){
        this.clear(ctx)

        let st = this.stroke
        let pts = this.points

        st.step()
        st.wrap(ctx, ()=>{
            pts.pen.stroke(ctx)
            pts.pen.fill(ctx, '#000000AA')
        })

        ctx.fillStyle = '#DDD'
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        pts.forEach(function(p, i, a){
            let t = String.fromCharCode(97 + i)
            p.text.fill(ctx, t.toUpperCase())
        })

    }
}

stage = MainStage.go()
