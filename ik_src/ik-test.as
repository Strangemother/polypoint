/**
 * Copyright hycro ( http://wonderfl.net/user/hycro )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/3t2B
 */

package {
    import flash.display.StageScaleMode;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.geom.Point;

    [SWF(frameRate="60")]
    public class IKTest extends Sprite {
        private var _list:SegmentList;

        public function IKTest() {
            init();
        }

        private function init():void {
            stage.scaleMode = StageScaleMode.NO_SCALE;
            _list = createSegmentList(1000, 3);
            addEventListener(Event.ENTER_FRAME, onEnterFrame);
        }

        private function createSegmentList(size:uint, segmentLength:Number):SegmentList {
            var sl:SegmentList = new SegmentList(new Point(0, 0));
            for (var i:uint = 1; i <= size; i++) {
                sl.addSegment(new Point(i % 2 ? segmentLength : 0,  0));
            }
            return sl;
        }

        private const colors:Array = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF];
        private function onEnterFrame(evt:Event):void {
            var count:uint = 0;
            _list.drag(new Point(mouseX, mouseY));
            graphics.clear();
            graphics.moveTo(_list.head.point0.x, _list.head.point0.y);
            for (var segment:Segment = _list.head; segment != null; segment = segment.next) {
                graphics.lineStyle(4, colors[count++ % colors.length]);
                graphics.lineTo(segment.point1.x, segment.point1.y);
            }
        }
    }
}


import flash.geom.Point;

class SegmentList {
    private var _head:Segment;
    private var _tail:Segment;
    private var _origin:Point;

    public function SegmentList(origin:Point) {
        _origin = origin;
    }

    public function get tail():Segment
    {
        return _tail;
    }

    public function get head():Segment
    {
        return _head;
    }

    public function addSegment(point:Point):Segment {
        if (_tail) {
            var segment:Segment = new Segment(_tail.point1, point);
            segment.prev = _tail;
            _tail.next = segment;
            _tail = segment;
        } else {
            _tail = new Segment(_origin, point);
            _head = _tail;
        }

        return _tail;
    }

    public function drag(target:Point):void {
        if (_tail == null) {
            return;
        }
        _tail.point1 = target;
        for (var segment:Segment = _tail; segment != null; segment = segment.prev) {
            segment.restore();
        }
    }
}

class Segment {
    public var point0:Point;
    public var point1:Point;
    public var next:Segment;
    public var prev:Segment;
    public var restoreRaito:Number = 1;

    private var _originalLength:Number;

    public function Segment(point0:Point, point1:Point) {
        this.point0 = point0;
        this.point1 = point1;
        _originalLength = this.length;
    }

    public function restore():void {
        var dx:Number = point1.x - point0.x;
        var dy:Number = point1.y - point0.y;
        var m:Number = .5 - _originalLength / Point.distance(point0, point1) * .5;

        point0.x += m * dx * restoreRaito * 2;
        point0.y += m * dy * restoreRaito * 2;
        point1.x -= m * dx * (1-restoreRaito) * 2;
        point1.y -= m * dy * (1-restoreRaito) * 2;
    }

    public function get length():Number {
        return Point.distance(point0, point1);
    }
}