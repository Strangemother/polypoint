/* As the tin suggests, the 'svg' component _makes an SVG_.
The SVG is editable and made new.


    var svg = new PrimaryContext(undefined, '#container')
    window.pipes = svg
    svg.start()

Target a container or an svg name:

    var svg = new PrimaryContext('svd_id')

SVG First, then fallback to the container:

    var svg = new PrimaryContext('svd_id', "#svg_pawn_div")


For free we have a rendering layer, iterating objects and discovering a render()
function:

    svg.addItem({
        render() {
            ...
        }
    })

 */

var newPath = function(svg, name){
    var $path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
    $path.id = name
    $path.setAttribute("d","M 0 0 L 10 10"); //Set path's data
    $path.style.stroke = "#000"; //Set stroke colour
    $path.style.strokeWidth = "5px"; //Set stroke width
    svg[0].appendChild($path);
    return document.querySelector(name)
}


var rand = function(){
    return Math.random().toString(32).slice(2)
}



var newSVG = function(id, parent) {
    let home = parent || 'body'
    //let $svg = $("<svg/>", )
    let $svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    $svg.id = id? id: rand()
    $svg.setAttribute('height', 0)
    $svg.setAttribute('width', 0)
    document.querySelector(home).appendChild($svg)

    return $svg;
}


class SVGContext {

    constructor(svgName, containerSelector){
        console.log('New unit on', svgName, containerSelector)
        this.svgSelector = `#${svgName}`
        this.svgName = svgName
        this.containerSelector = containerSelector

    }

    start(){

        console.log('start unit')
        this.$container = document.querySelector(this.containerSelector)

        let svg = document.querySelector(this.svgSelector)
        this.$svg = svg

        if(svg == null){
            this.$svg = this.createContext()
        }

        this.applyWindowHandlers()
    }

    createContext(){
        /* Generate a new SVG using the internal names and append
        the new svg to the given container.
        If the svg exists, it's reused else a new one is created. */
        console.log('Creating new SVG', this.svgName)
        let svg = newSVG(this.svgName, this.containerSelector)

        svg.classList.add('pipes')
        this.$container.appendChild(svg) // $("<svg/>", {id: this.svgName})
        return svg
    }

    resetSVGsize(x=0, y=0){
        /* Reset the svg size to 0 0*/
        this.resize(x,y)
    }


    applyWindowHandlers(){
        /* Apply ready and resize handlers to the window and document
        to call render() upon an event. */
        // $(document).ready(this.render.bind(this))
        // $(window).resize(this.render.bind(this))
    }

    resize(width, height) {
        let $svg = this.$svg

        $svg.height.baseVal.value =  height
        $svg.width.baseVal.value =  width

        $svg.setAttribute('height', height)
        $svg.setAttribute('width', width)
    }

    render(){
        //console.log('render pipes')
        this.resetSVGsize();
    }
}


class PrimaryContext extends SVGContext {
    /*
    The context acts as a simple manager for many units on an SVG.

    Provde a svg name - used as an ID and a container selector. If the svgname
    does not exist as an svg# a new one is created.
    If the containerSelector is undefined, the newly generated svg is appended to
    the body.

    If the svg of name ID exists, it's used rather than creating, but it's still
    moved into the container (if given)

        containerSelector = '#my_container'
        svgName = 'svg1' // note - Not a jquery selector;
        context = new PrimaryContext(svgName, containerSelector)
        context.start()

        context.addItem({
            name: 'bob'
        })

        context.render()
     */
    liveResize = false

    constructor() {
        super(...arguments)
        this.items = []
        window.addEventListener("resize", (event) => { this.remapNodes() });

    }

    render(){
        // super.render()
        this.renderStack(this.containerSelector, this.svgSelector)
    }

    warn(line) {
        let f = function() {
            let j = JSON.stringify(line)
            console.warn(`unit has no render() function: ${j}`)
        }
        return f
    }

    renderStack(){
        //connectAll(this.containerSelector, this.svgSelector)
        this.adaptDrawLayer(this.liveResize)
        let warn = this.warn
        for(let line of this.items) {
            /* A line representsa tidy or class instance version of the
            user config. */
            let f = (line.render == undefined? warn(line): line.render.bind(line))
            f()
        }
    }

    remapNodes() {
        this.rerenderTimer = clearTimeout(this.rerenderTimer)

        this.rerenderTimer = setTimeout(function(){
            this.render()
        }.bind(this), 50)
    }

    adaptDrawLayer(given=true) {
        // check if the svg is big enough to draw the path, if not, set heigh/width
        //conf = svg, coord, padding
        //

        let lines = this.items;
        let line = lines[0]
        if (this.$svg.clientHeight < window.innerHeight) {
            //this.svg.attr("height", $(window).height() - 10)
        }

        if(!given) {
            return
        }

        let maxHeight = 0, maxWidth = 0, minTop=10000;
        for(let line of lines) {
            let coord = line.getRect()
            if(maxHeight < coord.ay) {
                maxHeight = coord.ay
            }

            if(minTop > coord.bx) {
                minTop = coord.bx
            }

            if(minTop > coord.ax) {
                minTop = coord.ax
            }

            if(maxHeight < coord.by) {
                maxHeight = coord.by
            }

            if(maxWidth < coord.ax) {
                maxWidth = coord.ax
            }

            if(maxWidth < coord.bx) {
                maxWidth = coord.bx
            }
        }
        //this.svg.attr("width", $(window).width() - 10)
        let padding = 10//line.style.padding;
        //let height = Number(line.$svg.attr("height"))
        //let width = Number(line.$svg.attr("width"))
        //let coord = line.getCoord()

        //console.log(coord)
        //console.log(height , conf.coord.by + conf.padding )

        /*
        If the SVG is static; it should be absolute and x:y < the
        path x:y.
        The maxHeight ensure the largest X value (element cloest to the bottom)
        doesn't account for the -offset of the SVG position. Therefore
        adding the different of the most bottom (y) indexed element,
        */
        let height = maxHeight + padding + minTop
        let width = maxWidth + padding
        this.resize(width, height)
    }

    addItem(config) {
        /*
            {
                name: 'name'
                start: Node
                end: Node
            }
         */
        // let $path = newPath(this.$svg, config.name)
        // let line = {
        //     $path,
        // }

        // Object.assign(line, config)
        // let line = new Line(this.$svg, config)
        this.items.push(config)
        if(config.load) {
            config.load(this)
        }
        return config
    }

}

