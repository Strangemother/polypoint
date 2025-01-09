/*
title: SVG Example
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
    ../theatre/a.js
---

 */


var newSVG = function(id, parent) {
    let home = parent || 'body'
    //let $svg = $("<svg/>", )
    let $svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    $svg.id = id
    $svg.setAttribute('height', 0)
    $svg.setAttribute('width', 0)
    // document.querySelector(home).appendChild($svg)

    return $svg;
}



let pathSetPathFunction = function(d) {
    /* Apply as `path.setPath` as a helper to set the `d` attribute of a
    Path node.
     */
    this.setAttribute('d', d)
    return d
}



const newNode = function(type='path', id, p){
    let nsUri = "http://www.w3.org/2000/svg"
    var $node = document.createElementNS(nsUri, type); //Create a path in SVG's namespace
    $node.id = id
    $node.setPath = pathSetPathFunction
    $node.setPath(getInitD(p)); //Set path's data
    $node.style.stroke = "#000"; //Set stroke colour
    $node.style.strokeWidth = "5px"; //Set stroke width
    return $node
}

const getInitD = function(p){
    let width = p.radius
        , rad = width*2
        , neg_rad = -rad
        // , a = this.coords.a
        , a = p
        ;

        let arc = commands.arc;
    // debugger;
    let b = [
        `M ${a.x}, ${a.y}`
        , ` m -${width}, 0`
        , ` ${arc.rel} ${width}, ${width} 0 1, 0 ${rad}, 0`
        , ` ${arc.rel} ${width}, ${width} 0 1, 0 -${rad}, 0`
    ].join('')

    return b
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.dragging.add(this.point)
        this.svg = newSVG('new-svg')

        this.svg.setAttribute('height', 300)
        this.svg.setAttribute('width', 400)
        this.canvas.parentElement.appendChild(this.svg)

        let path = newNode('path', 'foobar', this.point)
        this.svg.appendChild(path)
    }

    onMousedown(ev) {
        // this.iPoint.rotation = random.int(180)
        commands.move(...this.point.xy)
    }

    draw(ctx){
        this.clear(ctx)

        this.point.pen.indicator(ctx)

    }
}


console.log('chord');


stage = MainStage.go(/*{ loop: true }*/)
