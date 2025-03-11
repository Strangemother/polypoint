/*
Capture errors and apply them to the view, using petite-vue
 */

class GlobalErrorApp extends Mountable {
    storageName = 'globalErrorApp'
    mounted(){
        addEventListener('error', (ev)=>this.errorEventHandler.bind(this))
        if(globalErrorStash.lastError) {
            this.handleStashedError(globalErrorStash.lastError)
        }
    }

    initData(){
        return { hasError: false, errorText: {message: 'no text', stackText: ''} }
    }

    errorEventHandler(ev){
        this.handleStashedError(ev.error.stack)
    }

    handleStashedError(lastError) {
        this.store.hasError = true
        // lastError.stackText = JSON.stringify(lastError.stack, null, 4).toString()
        lastError.stackText = lastError.stack.toString()
        this.store.errorText = lastError
    }

}

const globalErrorApp = GlobalErrorApp.loadMount('#global_error_app')

