
function zip() {
    /* Usage:

    zip(this.splits1, this.splits2).forEach(()=>{
            (new PointList(pair)).pen.line(ctx)
        })
    */
    let width = arguments.length;
    let height = 0
    for (var i = 0; i < width; i++) {
        let r = arguments[i]
        if(r.length > height) { height = r.length }
    }

    debugger;
}