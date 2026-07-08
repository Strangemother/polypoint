

const theatreChange = function(ev) {
    let v = ev.target.selectedOptions[0].value
    console.log('Change', v)
    u = new URL(window.location.href);
    u.pathname = `/editor/v1/${v}`
    let newUrl = u.toString()
    window.location = newUrl
}