
// Works.
let defaultRad = (Math.PI2 + degToRad(-90) + Math.PI) % Math.PI2


class XYBindMap {
    constructor() {
        this.bindMap = new Map()
        this.bindMapRev = new Map()
    }

    step(){
        this.bindMap.forEach(this.pairTest.bind(this))
    }

    updateFunction(target, parent) {
        target.xy = parent.xy
    }

    childToParentUpdate(target, parent, opts, d){

        // console.log('primary drag')
        let updateRequired = !(d.distance < 2);
        let xy = target.xy

        if(opts.angle != undefined) {
            /* Calculate the angle based on the current location.

            This is the inverse of the primary location.*/
            let parentRad = (parent.radians + Math.PI * 3) % Math.PI2

            let rads = opts.relative? parentRad: defaultRad
            let angle = opts.angle + rads
            // let angle = (Math.PI2 + (rads + opts.angle)) % Math.PI2
            let distance = opts.distance
            opts.x = -(d.x + (distance * Math.cos(angle)))
            opts.y = -(d.y + (distance * Math.sin(angle)))
            // console.log(d)
            target.xy = [
                  xy[0] + opts.x
                , xy[1] + opts.y
            ]
            updateRequired = false
        }

        if(opts.speed) {
            target.xy = [
                xy[0] + opts.x * opts.speed
                , xy[1] + opts.y * opts.speed
            ]
        }

        target._updateRequired = updateRequired
    }

    lockedPosition(target, parent, opts, d){
        /* position is locked (reverse) */
        // Update for the child, in reverse
        let rads = opts.relative? target.radians: defaultRad
        // let angle = rads + opts.angle
        let angle = rads + opts.angle
        let xy = target.xy
        if(opts.relative !== true) {
            angle += Math.PI * 3
        }
        opts.x = (d.x + (opts.distance * Math.cos(angle)))
        opts.y = (d.y + (opts.distance * Math.sin(angle)))

        target.xy = [
              xy[0] - (opts.x * opts.speed)
            , xy[1] - (opts.y * opts.speed)
        ]

        target._updateRequired = false
    }

    relockingPosition(target, parent, opts){
        /* Dragging a relative control point. */
        // Update for the child, in reverse
        opts = Object.assign({}, parent._bindingSettings)
        // let angle = (Math.PI + (target.radians + opts.angle)) % Math.PI2
        // opts.x = (d.x + (opts.distance * Math.cos(angle)))
        // opts.y = (d.y + (opts.distance * Math.sin(angle)))
        let rot = calculateAngle360(parent, target, parent.rotation)
        parent._bindingSettings.angle = degToRad(rot) + Math.PI
        parent._bindingSettings.distance = parent.distanceTo(target)
        // console.log(d)
        // target.xy = [
        //       xy[0] - opts.x
        //     , xy[1] - opts.y
        // ]
        target._updateRequired = false
    }

    smoothUpdateFunction(target, parent) {

        let xy = target.xy
        let d = distance2D(xy, parent.xy)

        /* If _bindingSettings are defined, the lock step will
        pre-lock the control point.*/
        if(d.distance < 2 && target._bindingSettings==undefined) {
            //lock it
            target._updateRequired = false
            return this.updateFunction(target, parent)
        }

        let settings = {
            /* the _Settings_ here are _add_ applied to the
            current target XY. Therefore
            we apply an initial minus value to add. */
            x: -d.x,
            y: -d.y,
            speed: 1,
            /* If relative, the parent point radians is taken into
            account. */
            relative: true,
        }

        if(target._bindingSettings) {
            /* Dragging the primary item activates this _target_
            (the control point). */
            settings = Object.assign(settings, target._bindingSettings)
            return this.childToParentUpdate(target, parent, settings, d)
        }

        if(parent._bindingSettings) {
            /* Actuaing the _primary_ */
            // console.log('secondary drag')
            settings = Object.assign(settings, parent._bindingSettings)
            if(settings.angle != undefined) {
                if(settings.movable) {
                    return this.relockingPosition(target, parent, settings, d)
                }
                return this.lockedPosition(target, parent, settings, d)
            }
        }

        // console.log(d)
        target.xy = [
              xy[0] + (settings.x * settings.speed)
            , xy[1] + (settings.y * settings.speed)
        ]

        target._updateRequired = !(d.distance < 2)
    }

    pairTest(vChildren, kOwner) {
        vChildren.forEach(vChild => this.pairTestSingle(vChild, kOwner) )
    }

    pairTestSingle(vChild, kOwner) {
        /* Iterate the bindmap, ensuring the XY of a pair match
        Propagate the changed value (dirty) to the unchanges value. */

        let target = undefined //vChild
        let parent = undefined // kOwner

        /* Stringy here, as that correctly tests the array == array */
        let kOwner_dirty = kOwner._xy && kOwner._xy.toString() != kOwner.xy
        let vChild_dirty = vChild._xy && vChild._xy.toString() != vChild.xy

        // alt dirty check.
        vChild_dirty = vChild._dirty == undefined? vChild_dirty: vChild._dirty// || (~~vChild.xy == ~~kOwner.xy)
        kOwner_dirty = kOwner._dirty == undefined? kOwner_dirty: kOwner._dirty// || (~~kOwner.xy == ~~vChild.xy)
        if(vChild._updateRequired) {
            // console.log('dirty child')
            kOwner_dirty = true
        }

        if(kOwner._updateRequired) {
            // console.log('dirty owner')
            vChild_dirty = true
        }


        if(kOwner_dirty === true) {
            /*
                The parent is dirty, push the changes to the child.
            */
            // vChild.xy = kOwner.xy
            target = vChild
            parent = kOwner
            // console.log('dirty owner')
        }

        if(vChild_dirty === true) {
            /* The child vars are dirty, propagate to the parent */
            // copy back to parent.
            target = kOwner
            parent = vChild
        }

        let updateRequired = target && target._updateRequired == true
        let parentUpdateRequired = parent && parent._updateRequired == true

        if(parentUpdateRequired || updateRequired || kOwner_dirty || vChild_dirty) {
            /*
                Only occurs if either are dirty, pushing the _dirty_ (changed)
                value to the currently unchanged.
             */
            // target && (target._dirty = true)// d < target.radius
            // target._updateRequired = !(d.distance < 5)
            this.smoothUpdateFunction(target, parent)
            // updateFunction()
            // console.log(target.radius, target._updateRequired)
        }

        // Is now clean.
        vChild._xy = vChild.xy
        kOwner._xy = kOwner.xy
    }

    connect(parent, child, childPositionSettings={}) {
        // child.parentWheel = parent
        // parent.childWheel = child
        if(childPositionSettings.lock) {
            child.xy = parent.xy
        }
        // parent._dirty = true
        child._bindingSettings = childPositionSettings
        // child.isPinion = true
        this.safeMapAppend(this.bindMap, parent, child)
        // this.bindMap.set(parent, child)
        // this.bindMapRev.set(child, parent)
        this.safeMapAppend(this.bindMapRev, child, parent)
    }

    safeMapAppend(bindMap,parent, child) {
        if(bindMap.has(parent)) {
            let items = bindMap.get(parent)
            items.push(child)
            return
        }

        bindMap.set(parent, [child])

    }
}


let globalXYBind = new XYBindMap(this)
Polypoint.head.lazierProp('Stage', function xyBind(){
    // console.log('Returning new lazyProp "xyBind"')
    return globalXYBind
});


class PointXYBind {
    constructor(point) {
        this.point = point
        this.settings = {}
    }

    connectTo(other, opts={}) {
        let settings = Object.assign(this.settings, opts)
        return globalXYBind.connect(this.point, other, settings)
    }

    follow(other, opts={}) {
        let settings = Object.assign(this.settings, opts)
        return globalXYBind.connect(other, this.point, settings)
    }
}


Polypoint.head.deferredProp('Point',
    function xyBind() {
        return new PointXYBind(this)
    }
);

Polypoint.head.installFunctions('Point',{
    xyBindChild(other, settings={}) {
        return this.xyBind.connectTo.apply(this.xyBind, arguments)
    }
    , xyBindParent(other, settings={}) {
        return this.xyBind.follow.apply(this.xyBind, arguments)
    }
});
