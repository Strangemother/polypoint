
document.addEventListener('DOMContentLoaded', ()=>{
    let $frame = document.querySelector('.pinned-demo iframe')
    $frame.onload = function(){
        sendPin()
    }
    window.onresize = sendPin
})

let sendPin = function(){
    let $frame = document.querySelector('.pinned-demo iframe')
    let $pin = document.querySelector(".pinpoint-container .pinpoint")
    let frame = $frame.getBoundingClientRect()
    let pin = $pin.getBoundingClientRect()
    let left = pin.left - frame.left
    let top = pin.top - frame.top
    $frame.contentWindow.postMessage({ x: ~~left, y: ~~top})
}


