
class PointCast {
    /* a bunch of convert function, such as "asObject", wrapped within a sub unit

        Point.as.object()
    */

    constructor(point) {
        this.point = point
    }

    object() {
        let point = this.point;
        return {
            x: point.x
            , y: point.y
            , radius: point.radius
            , rotation: point.rotation
        }
    }

    array(fix=false) {
        let target = this.point;
        if(fix) {
            let int = (x)=> Number( x.toFixed(Number(fix)) )
            return [int(target.x), int(target.y), int(target.radius), int(target.rotation)]

        }
        return [target.x, target.y, target.radius, target.rotation]
    }
}


Polypoint.head.install(PointCast)
Polypoint.head.lazierProp('Point', function(){ return new PointCast(this)}, 'as')

