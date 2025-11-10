/*


A generic stage can start using the go() method:

    stage = MainStage.go()

Alternatively we can announce() a stage, hooking occurs by the _caturing_ tool:

    MainStage.announce()




 */

// let ret = document.querySelector('.playspace-container').getBoundingClientRect();
// let retC = document.querySelector('#playspace')

// retC.width = ret.width
// retC.height = ret.height
const defaultCanvas = '#playspace'

addEventListener('stage::announce', (ev)=>{
    const detail = ev.detail;
    console.log('stage::announce event', detail)
    // console.log(script.src)
    let canvas = detail.target == undefined? defaultCanvas: detail.target
    detail.StageClass.go(canvas)
});
