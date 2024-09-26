/* A "Velocity" class to represent _motion_ of a point or entity.
In truth this is a lot like the _point_ - but contains specific tools.
for `vx` and `vy` values. */


class Vector {

    constructor(x=0, y=0, parent=undefined) {
        this.x = x
        this.y = y
        this.parent = parent;
    }

    //  Static methods
    static len(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    static angle(x, y) {
        return Math.atan2(y, x);
    }

    getClass() {
        return this.constructor
    }

    add(v) {
        let C = this.getClass()
        return new C(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        let C = this.getClass()
        return new C(this.x - v.x, this.y - v.y);
    }

    mul(v) {
        let C = this.getClass()
        return new C(this.x * v.x, this.y * v.y);
    }

    div(v) {
        let C = this.getClass()
        return new C(this.x / v.x, this.y / v.y);
    }

    scale(coef) {
        let C = this.getClass()
        return new C(this.x*coef, this.y*coef);
    }

    mutableSet(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    mutableAdd(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    mutableSub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mutableMul(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    mutableDiv(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    mutableScale(coef) {
        this.x *= coef;
        this.y *= coef;
        return this;
    }

    equals(v) {
        return this.x == v.x && this.y == v.y;
    }

    epsilonEquals(v, epsilon) {
        return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
    }

    length(v) {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    length2(v) {
        return this.x*this.x + this.y*this.y;
    }

    dist(v) {
        return Math.sqrt(this.dist2(v));
    }

    dist2(v) {
        var x = v.x - this.x;
        var y = v.y - this.y;
        return x*x + y*y;
    }

    normal() {
        var m = Math.sqrt(this.x*this.x + this.y*this.y);
        let C = this.getClass()
        return new C(this.x/m, this.y/m);
    }

    dot(v) {
        return this.x*v.x + this.y*v.y;
    }

    det(v) {
        return this.x * v.y - this.y * v.x;
    }

    //  Instance methods
    set(x, y) {
        this.x = x; this.y = y;
    }

    copy(v) {
        this.x = v.x; this.y = v.y;
        return this;
    }

    len(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    angle(v){
        if(v === undefined) {
            return Math.atan2(this.y, this.x);
        }
        return this.angleWith(v)
    };

    angleWith(v) {
        return Math.atan2(this.x*v.y-this.y*v.x,this.x*v.x+this.y*v.y);
    }

    angle2(vLeft, vRight) {
        return vLeft.sub(this).angle(vRight.sub(this));
    }

    rotate(origin, theta) {
        var x = this.x - origin.x;
        var y = this.y - origin.y;
        let C = this.getClass()
        return new C(x*Math.cos(theta) - y*Math.sin(theta) + origin.x, x*Math.sin(theta) + y*Math.cos(theta) + origin.y);
    }


    mutableRotate(r) {
        var x = this.x,
            y = this.y,
            c = Math.cos(r),
            s = Math.sin(r);
        this.x = x * c - y * s;
        this.y = x * s + y * c;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    setLen(l) {
        var s = this.len();
        if( s > 0.0 ) {
            s = l / s;
            this.x *= s;
            this.y *= s;
            return
        }

        this.x = l;
        this.y = 0.0;
    }

    normalize(){
        this.setLen(1.0);
    }

}

/*
Point.vx == Point.velocity.x
Point.vy == Point.velocity.y
 */

Polypoint.head.mixin('Point', {
    velocity: {
        get() {
            let v = this._velocity
            if(v){
                return v
            }
            return this._velocity = new Vector(0,0, this)

        }
        , set(v) {
            this._velocity = v
        }
    }
    , vx: {
        get() {
            return this.velocity.x
        }
        , set(v) {
            this.velocity.x = v
        }
    }
    , vy: {
        get() {
            return this.velocity.y
        }
        , set(v) {
            this.velocity.y = v
        }
    }
})