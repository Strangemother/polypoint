

class Stages {
    /* A Singleton to manage global functions and data */
    loaded = false
    canvas = undefined

    constructor() {
        this.stages = new Map
        this.canvasMap = new Map

        addEventListener('stage:load', (e)=>this.add(e.detail.stage));
    }

    add(stage) {
        console.log('Installing stage into stages.')
        this.stages.set(stage.id, stage);
        if(!this.loaded) {
            this.load(stage)
            this.loaded = true
        }
    }

    resolveNode(target, stage) {
        /* Given a target as a string or entity, return the resolved
        html entity.

            resolveNode('myId')
            resolveNode('#querySelector canvas')
            resolveNode(canvas)
        */
        return resolveCanvas(target, stage)
    }

    load(stage){
        let canvas = stage.canvas

        if(!this.canvasMap.has(canvas)) {
            //install a new canvas.
            this.installCanvas(canvas, stage)
        }

    }

    installCanvas(canvas, stage){
        this.canvasMap.set(canvas, stage)
        Point.mouse?.mount(canvas)
    }
}


stages = new Stages;

