

class DimensionsApp extends Mountable {
    storageName = 'dimensionsApp'
    mounted(){
        // console.log('dimensionsApp Mounted')
        let hookHandle = ()=> stage.events.on('resize', this.resizeEventHandler.bind(this));

        try{

            if(stage) {
                hookHandle()
                this.record(stage.dimensions)
            }
        } catch {
            ;addEventListener('stage:prepare', function(event){
                let {id, canvas, stage} = event.detail
                hookHandle()
            })
        }
    }

    initData(){
        return { width: 10, height: 10}
    }

    resizeEventHandler(e){
        // this.store.width = ~~e.detail.width
        // this.store.height = ~~e.detail.height
        this.record(e.detail)
        // console.log(this.store)
    }

    record(dimensions){
        this.store.width = ~~dimensions.width
        this.store.height = ~~dimensions.height
    }
}

const dimensionsApp = DimensionsApp.loadMount('#dimensions_app')

