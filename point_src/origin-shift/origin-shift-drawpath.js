const drawPath = function(startIndex, os=os) {
    let running = true;
    let index = startIndex;
    let next
    let lastNode;
    let count = 0;
    let max = 5000;
    let tin = +(new Date)
    let pointList = os.pointList
    let origin = os.origin
    while(running) {
        if(count > max) {
            console.log('Break at max', max, 'index=', index)
            running = false;
            return index
        }
        let p = pointList[index]
        p.lineColor = 'red'
        index = p.target;
        running = index != undefined
        if(origin==index) {
            console.log('Hit origin in', count)
            running = false;
            return index
        }
        count++;
        lastNode = index
    }
    let tout = +(new Date)
    let taken = tout - tin
    console.log('drawPath done in count', count, 'time Taken', taken)
    return index
}
