

// let ret = document.querySelector('.playspace-container').getBoundingClientRect();
// let retC = document.querySelector('#playspace')

// retC.width = ret.width
// retC.height = ret.height

class DimensionsApp extends Mountable {
    storageName = 'dimensionsApp'
    mounted(){
        // console.log('dimensionsApp Mounted')
        setTimeout(this.removeStick, 1)

        let hookHandle = ()=> {
            // console.log(ret);
            // stage.resize(undefined, ret)
            stage.events.on('resize', this.resizeEventHandler.bind(this));
        }

        try{

            if(stage) {
                hookHandle()
                // let node = document.querySelector('.border-panel')
                // this.copyRelativeShape(node)
                this.record(stage.dimensions)
            }
        } catch {
            ;addEventListener('stage:prepare', function(event){
                let {id, canvas, stage} = event.detail
                hookHandle()
            })
        }
    }

    removeStick(){
        document.querySelector('.playspace-container').classList.remove('stick-canvas')
    }

    addStick(){
        document.querySelector('.playspace-container').classList.add('stick-canvas')
    }

    reStick() {
        this.addStick()
        stage.stickCanvasSize(stage.canvas);

        setTimeout(this.removeStick, 1000)
        // stage.resize();
    }

    initData(){
        return { width: 10, height: 10 }
    }

    copyRelativeShape(node) {
        let rect = node.getBoundingClientRect()
        stage.stickCanvasSize(stage.canvas, rect);
        stage.resize();
    }

    enterKey(e) {
        let _type = e.currentTarget.dataset.type
        e.preventDefault()
        let v = parseInt(e.currentTarget.textContent)
        console.log('Enter', _type, v)
        this.store[_type] = v
        let rect = stage.stickCanvasSize(stage.canvas, {[_type]: v})
        stage.resize(undefined, rect)
    }

    resizeEventHandler(e){
        console.log('Resuze hanlfer')
        // this.store.width = ~~e.detail.width
        // this.store.height = ~~e.detail.height
        this.record(e.detail)
        // console.log(this.store)
        this.reStick()
    }

    record(dimensions){
        this.store.width = ~~dimensions.width
        this.store.height = ~~dimensions.height
    }
}

const dimensionsApp = DimensionsApp.loadMount('#dimensions_app')

