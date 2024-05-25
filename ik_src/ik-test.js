/**
 * Copyright hycro ( http://wonderfl.net/user/hycro )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/3t2B
 */


const colors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF];


class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }

    static distance(a, b){
        return Math.hypot(b.x - a.x, b.y - a.y);
    }
}


const createSegmentList = function(size, segmentLength) {
    var sl = new SegmentList(new Point(0, 0));

    for (var i = 1; i <= size; i++) {
        sl.addSegment(new Point(i % 2 ? segmentLength : 0,  0));
    }

    return sl;
}


class SegmentList {
    head = undefined // :Segment;
    tail = undefined // :Segment;
    origin = undefined // :Point;

    constructor(origin) {
        this.origin = origin;
    }

    addSegment(point) {
        let tail = this.tail

        if(tail == undefined) {
            tail = new Segment(this.origin, point);
            this.head = tail;
            this.tail = tail
            return tail;
        }
            var segment = new Segment(tail.point1, point);
        segment.prev = tail;
        tail.next = segment;
        this.tail = segment;
        return tail
    }

    drag(target) {
        if (this.tail == null) {
            return;
        }

        this.tail.point1 = target;

        var segment = this.tail;
        var forced = 1
        while(segment != null){
            segment.restore(forced);
            segment = segment.prev
            forced = undefined;
        }

        // for (var segment = this.tail; segment != null; segment = segment.prev) {
        //     segment.restore();
        // }
    }
}


class Segment {
    point0 = undefined // :Point
    point1 = undefined // :Point
    next = undefined // :Segment
    prev = undefined // :Segment
    restoreRatio = .9 // :Number
    pinned = false
    _originalLength = undefined//:Number;

    constructor(point0, point1) {
        this.point0 = point0;
        this.point1 = point1;

        this._originalLength = this.length;
    }

    restore(forcedRatio){
        let restoreRatio = forcedRatio == undefined? this.restoreRatio: forcedRatio
        if(this.pinned == true) {
            return
        }
        let point0 = this.point0
        let point1 = this.point1

        let dx = point1.x - point0.x;
        let dy = point1.y - point0.y;
        let m = .5 - this._originalLength / Point.distance(point0, point1) * .5;

        this.point0.x += m * dx * restoreRatio * 2;
        this.point0.y += m * dy * restoreRatio * 2;
        this.point1.x -= m * dx * (1-restoreRatio) * 2;
        this.point1.y -= m * dy * (1-restoreRatio) * 2;

    }

    get length() {
        return Point.distance(this.point0, this.point1)
    }
}




