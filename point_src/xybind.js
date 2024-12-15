
// Works.
class XYBindMap {
    constructor() {
        this.bindMap = new Map()
        this.bindMapRev = new Map()
    }

    step(){
        const pairTest = (vChild, kOwner)=>{
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
                const updateFunction = function() {
                    target.xy = parent.xy
                }

                const smoothUpdateFunction = function() {

                    let xy = target.xy
                    let d = distance2D(xy, parent.xy)
                    if(d.distance < 2) {
                        //lock it
                        target._updateRequired = false
                        return updateFunction()
                    }

                    let settings = {
                        x: -(d.x * .1),
                        y: -(d.y * .1),
                    }

                    if(target._bindingSettings) {
                        /* The child item.*/
                        console.log('a')
                        // settings = Object.assign({}, target._bindingSettings)
                        // let angle = settings.angle + parent.radians
                        // let distance = settings.distance
                        // settings.x = -(d.x + (distance * Math.cos(angle)))
                        // settings.y = -(d.y + (distance * Math.sin(angle)))
                        // console.log(d)
                        target.xy = [
                              xy[0] + settings.x
                            , xy[1] + settings.y
                        ]

                        // target._updateRequired = false
                        // return

                    } else if(parent._bindingSettings) {

                        const lockedPosition = function(){
                            /* position is locked (reverse) */
                            // Update for the child, in reverse
                            settings = Object.assign({}, parent._bindingSettings)
                            let angle = (Math.PI + (target.radians + settings.angle)) % Math.PI2
                            settings.x = (d.x + (settings.distance * Math.cos(angle)))
                            settings.y = (d.y + (settings.distance * Math.sin(angle)))

                            // console.log(d)
                            target.xy = [
                                  xy[0] - settings.x
                                , xy[1] - settings.y
                            ]

                            target._updateRequired = false
                        }

                        const relockingPosition = function(){

                            // Update for the child, in reverse
                            settings = Object.assign({}, parent._bindingSettings)
                            // let angle = (Math.PI + (target.radians + settings.angle)) % Math.PI2
                            // settings.x = (d.x + (settings.distance * Math.cos(angle)))
                            // settings.y = (d.y + (settings.distance * Math.sin(angle)))
                            let rot = calculateAngle360(parent, target, parent.rotation)
                            parent._bindingSettings.angle = degToRad(rot)
                            parent._bindingSettings.distance = parent.distanceTo(target)
                            // console.log(d)
                            // target.xy = [
                            //       xy[0] - settings.x
                            //     , xy[1] - settings.y
                            // ]

                            target._updateRequired = false
                        }

                        // return lockedPosition()
                        // return relockingPosition()
                    }

                    // console.log(d)
                    target.xy = [
                          xy[0] + settings.x
                        , xy[1] + settings.y
                    ]

                    target._updateRequired = !(d.distance < 2)
                }

                // target && (target._dirty = true)// d < target.radius
                // target._updateRequired = !(d.distance < 5)
                smoothUpdateFunction()

                // updateFunction()
                // console.log(target.radius, target._updateRequired)
            }


            // Is now clean.
            vChild._xy = vChild.xy
            kOwner._xy = kOwner.xy

        }

        this.bindMap.forEach(pairTest)
    }

    connect(parent, child, childPositionSettings={}) {
        // child.parentWheel = parent
        // parent.childWheel = child
        child.xy = parent.xy
        child._bindingSettings = childPositionSettings
        // child.isPinion = true
        this.bindMap.set(parent, child)
        this.bindMapRev.set(child, parent)
    }
}
