/*
Capture errors and apply them to the view, using petite-vue
 */

window.addEventListener('error', function(ev){
    globalErrorHandler(ev)
})


const globalErrorHandler = function(ev) {
    console.log('Global Error Event', ev)
    document.querySelector('body').classList.add('error-state')
}
