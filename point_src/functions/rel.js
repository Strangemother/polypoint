
const rel = function(value) {
    return function relCaller(p, k) {
        // console.log('Call once')
        return p[k] + this.value
    }.bind({value})
}

