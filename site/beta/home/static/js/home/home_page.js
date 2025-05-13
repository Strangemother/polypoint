
document.addEventListener('DOMContentLoaded', ()=>{
    let $frame = document.querySelector('.pinned-demo iframe')
    if($frame) {

        $frame.onload = function(){
            sendPin()
        }
    }
    window.onresize = sendPin
})

let sendPin = function(){
    let $pin = document.querySelector(".pinpoint-container .pinpoint")
    let pin = $pin.getBoundingClientRect()

    let $frame = document.querySelector('.pinned-demo iframe')
    let frame = $frame?.getBoundingClientRect()
    if(frame) {
        let left = pin.left - frame.left
        let top = pin.top - frame.top
        let ev = { x: ~~left, y: ~~top}
        $frame.contentWindow.postMessage(ev)
    } else {
        let $frame = document.querySelector('.pinned-demo canvas')
        let frame = $frame?.getBoundingClientRect()
        let left = pin.left- frame.left
        let top = pin.top- frame.top
        let ev = { x: ~~left, y: ~~top}
        stage?.perspectiveCenter.set(ev)
        return ev
    }


}


