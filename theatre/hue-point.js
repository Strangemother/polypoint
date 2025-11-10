/*
title: HSL Color Point Animation
categories: basic
    dragging
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    ../point_src/easing.js
---

*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        let r = p.rotation
        let s =  clamp((p.x*.24) - 50, 0, 100)
        let se = quadEaseOut(s * .01) * 100
        let l = 100 - clamp((p.y*.24) - 50, 0, 100)
        let le = quadEaseOut(l * .01) * 100
        let color = `hsl(${r}deg ${se}% ${le}%)`
        this.point.pen.indicator(ctx, {color, width: 4})
    }
}

stage = MainStage.go(/*{ loop: true }*/)
