/*

Units to _track_ items and positions.
First version is just a set of distance testers,

version 2 includes a 'distance machine' to parallel compute many distances.

    d=new Distances;
    d.addPoints(...stage.points);


*/

class Distances {

    constructor(){
        this.points = new Map
    }

    addPoints() {
        for(let p of Array.from(arguments)){
            this.points.set(p.uuid, p)
        }
    }

    closest(point){
        var p;
        var low = undefined;
        /* Each distance is tested against the curent _low_.
        If the distance `v` is less than `low`, store `p`.

        In the first iteration, `setterFunc`, does not do a test, and replaces
        _itself_, with a testing function.

        This ensures we don't need to check for the first `undefined` .
        */
        var setterFunc = (v, e) => {
            low = v
            p = e
            setterFunc = (v, e) => {
                if(v < low) {
                    low = v;
                    p = e
                }
            }
        }
        this.each(function(e,i,a){
            let t = point.distanceTo(e)
            setterFunc(t, e)
        })
        return p
    }

    near(point, distance){
        var ps = new Set()
        if(distance == undefined) {
            distance = point.radius
        }
        var setterFunc = (v, e) => {
            if(v > distance) {
                return
            }
            // debugger
            ps.add(e)
        }

        this.each(function(e,i,a){
            let t = point.distanceTo(e)
            setterFunc(t, e)
        })
        return ps
    }

    each(caller) {
        return this.points.forEach(caller)
    }

    keep(caller) {
        let e = []
        return this.points.forEach((e,i,a)=> {
            let res = caller(e,i,a)
            if(res !== undefined) {
                r.push(e)
            }
        })

        return e
    }
}