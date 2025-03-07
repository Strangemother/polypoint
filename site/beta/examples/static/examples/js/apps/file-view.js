/*
The primary JS for the _file_ example view:

    http://localhost:8000/examples/label-example/

This file provides the _shared memory object_ and initiates the PetiteVue components.
 */

const appShared = {
    memoryCache: {}
    , miniApp: {}
    , widgetsApp: {}
    , earlyButtons: {}
}


const emitEvent = function(name, data) {
    let e = new CustomEvent(name, {detail: data})
    window.dispatchEvent(e)

}

const onEvent = function(name, handler) {
    // let e = new CustomEvent(name, {detail: data})
    // window.dispatchEvent(e)
    window.addEventListener(name, handler)
}


/* ------------------------------------- */

window.onload = function(){
    createMemoryApp(appShared.memoryCache)
    createMiniApp(appShared)
    createWidgetsApp(appShared)
}
