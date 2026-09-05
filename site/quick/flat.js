/*
flatfile for the following:


    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/compass.js
    ../point_src/center.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlistdraw.js
    ../point_src/pointlistgradient.js
    ../point_src/pointlistshape.js
    ../point_src/pointlistgenerator.js
    ../point_src/unpack.js
    ../point_src/pointlist.js
    ../point_src/relative-xy.js
    ../point_src/pointcast.js
    ../point_src/point.js
    ../point_src/text/beta.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/protractor.js
    ../point_src/dragging.js
    ../point_src/stage-hooks.js
    ../point_src/functions/resolve.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/gradient.js
*/
;(function(){



;
;
;(function(parent, name=undefined, debug=false, strict=true){

    var dlog = debug?console.log.bind(console): ()=>{}

    try{

        if(logger) {
            dlog = logger.create("head")
        }
    } catch{}

    const waiting = {}
    const currentScr = document.currentScript
    const currentLoc = document.currentScript.src


    const exposedConfig = { debug, strict, waiting, dlog }


    let parkedEntity = undefined;

    const resolveName = function(n){

        if(n === undefined) {

            n = currentScr.dataset.name
            const attr = currentScr.attributes.name
            if(attr) {
                n = attr.value
            };
        }

        if(n === undefined) {

            let src = currentScr.src;
            let u = new URL(src).hash.slice(1)
            if(u.length > 0) {
                n = u;
            }



        }

        if(n === undefined) {
            n = 'Polypoint'
        }

        return n;
    }

    name = resolveName(name)

    if(parent[name] !== undefined) {
        dlog('Parked asset on', name)
        parkedEntity = parent[name]
    }


    const fileObject = {
        meta(data) {

            dlog('meta config', data)
            if(data.files) {
                let src = document.currentScript
                dlog(src)
            }
        }
    }


    const mixin = function(target, addon, targetPrototype=true) {
        const targetName = target.getMixinTarget? target.getMixinTarget(): target

        if(exposed[targetName]) {

            dlog(`Installing mixin for "${targetName}"`)
            populateAddon(targetName, addon, targetPrototype)
            return
        }

        dlog('Mixin Waiting for unit', targetName)
        if(waiting[targetName] == undefined) {
            waiting[targetName] = []

        }

        waiting[targetName].push(addon)
    }


    const staticMixin = function(target, addon) {
        return mixin(target, addon, false)
    }


    const staticFunctions = function(target, methods) {
        let def = {}
        for(let k in methods) {
            let func = methods[k]
            def[k] = {
                value: func
                , writable: true
            }
        }
        return mixin(target, def, false)



    }

    const installMap = new Map;

    const dispatch = function(eventType, entity) {
        let name = `Polypoint:${eventType}`
        let detail = {
            entity
        }
        dispatchEvent(new CustomEvent(name, {detail}))
    }


    const install = function(entity, name=undefined) {
        if(name == undefined) {

            name = entity.name
        }


        dispatch('install', entity)
        exposed[name] = entity;

        if(waiting[name] != undefined) {

            populateAddons(name, waiting[name])
        }


        installMap.set(name, entity)
    }

    const installMany = function() {

       Array.from(arguments).forEach(C => install(C))
    }

    const populateAddons = function(name, items, targetPrototype=true) {
        dlog('Installing addons', items.length, 'to', name)
        for (var i = 0; i < items.length; i++) {
            populateAddon(name, items[i], targetPrototype)
        }
    }

    const populateAddon = function(name, item, targetPrototype=true) {
        dlog('populateAddon', name, item)
        let Klass = exposed[name]

        let proto = targetPrototype? Klass.prototype.constructor.prototype: Klass



        let r = {}

        let names = Object.getOwnPropertyNames(item);
        for(let name of names) {

            try {
                Object.defineProperties(proto, item)
                r[name] = true
            } catch(e) {
                r[name] = false
            }
        }
        return r
    }

    const define = function(proto, name, def) {
        Object.defineProperty(proto, name, def)

    }


    const installFunctions = function(name, functionsDict) {
        let def = {}
        for(let k in functionsDict) {
            let func = functionsDict[k]
            def[k] = {
                value: func
                , writable: true
            }
        }

        return mixin(name, def)
    }



    const lazyProp = function(name, propsDict) {

        dispatch('install:lazyProp', {name, propsDict})

        let def = {}

        for(let key in propsDict) {

            let propName = key
            let val = propsDict[key]

            def[propName] = { get: val }
        }

        return mixin(name, def)
    }



    const lazierProp = function(name, method, reference) {
        let methodName = reference==undefined? method.name: reference

        let target = exposed;
        lazyProp(name, {
            [methodName]() {
                let innerName = `_${methodName}`
                let s = exposed[innerName];
                if(s) { return s };
                return exposed[innerName] = method.bind(this)()

            }
        })
    }


    const deferredProp = function(name, method, reference) {
        let methodName = reference==undefined? method.name: reference

        return lazyProp(name, {
            [methodName]() {
                let innerName = `_${methodName}`
                let s = this[innerName];
                if(s) { return s };
                return this[innerName] = method.bind(this)()

            }
        })
    }

    const load = function(name, callback){

        return ljs.load(name, function() {
            dlog('Loaded', name, arguments);
            return callback && callback()
        })
    }


    const configure = function(data) {
        let r = Object.assign(exposedConfig, data)
        let files = data.files
        if(files) {
            if(typeof(files) == 'function') {

                let srcPath = r.srcPath;

                if(srcPath == undefined) {
                    console.warn('No "srcPath" given, assuming no path: ""')
                    srcPath = ''
                }
                assets = files(srcPath)
                ljs.addAliases(assets)
            }
        }

        if(data.load) {

            load(data.load, data.onLoad)
        }

        return r
    }

    const head = {
        add: function(func, scope) {
            let obj = exposed[scope]

            if(obj == undefined) {
                obj = exposed[scope] = {}
            }
            obj[func.name] = func
        }
        , config: exposedConfig
        , configure
        , load
        , staticFunctions
        , static: staticMixin
        , mixin, install, installMany
        , installFunctions
        , define
        , lazyProp, lazierProp, deferredProp
        , getter: lazyProp
        , singleton: lazierProp
        , prop: deferredProp

        , get installed() {
            return installMap.keys()
        }
    }

    const depSet = new Set;
    const printOnce = function(methodName) {
        if(depSet.has(methodName)){
            return
        }
        let old = `${name}.${methodName}`
        let _new = `${name}.head.${methodName}`
        depSet.add(methodName)
        console.warn(`Deprecated: "${old}()", Use "${_new}()"`)
    }


    const deprecate = function(innerFunc, name) {
        const methodName = name || innerFunc.name;
        let f = function(){
            printOnce(methodName)
            exposed[methodName] = innerFunc
            return innerFunc.apply(exposed, arguments)
        }

        f.name = methodName
        return f
    }

    const extend = {
        prop: deferredProp
        , singleton: lazierProp
        , getter: lazyProp
        , functions: installFunctions
        , mixin
        , static: staticMixin
        , install
        , installMany
    }

    const exposed = {
        ready: false
        , head
        , file: fileObject
        , extend
    }

    if(!strict){

        Object.assign(exposed, {
            mixin: deprecate(mixin)
           , static: staticMixin
            , install: deprecate(install)
            , installFunctions: deprecate(installFunctions)
            , define: deprecate(define)
            , lazyProp: deprecate(lazyProp)
            , lazierProp: deprecate(lazierProp)
        })
    }

    class Stub {

        constructor(prop, history=[]) {
            this.assignedName = prop
            this.history = history

            const proxy = new Proxy(this, {
                get(target, property, receiver) {
                    if(Reflect.has(target, property)){
                        return Reflect.get(target, property, receiver)
                    }
                    return target.getUndefined(target, property, receiver)
                },
            });
            return proxy;
        }

        getMixinTarget() {

            return this.assignedName
        }

        getUndefined(target, property, receiver) {
            dlog('get unknown', property, 'on stub')
            this.history.push(this.assignedName)
            return new this.constructor(property, this.history)
        }

        get(v) {
            dlog(v)
        }

        get [Symbol.toStringTag]() {
            return this.toString()
        }

        [Symbol.toPrimitive](hint) {
            if (hint === 'string') {
                return this.toString()
            }
            return Reflect.apply(...arguments)
        }

        toString(){
            return this.assignedName;
        }
    }


    const exposedProxyHandler = {
        get(target, prop, receiver) {

            if(!Reflect.has(target, prop)) {
                return this.getUnknown(target, prop, receiver)
            }


            return Reflect.get(target, prop, receiver)
        }

        , getUnknown(target, prop, receiver) {


            return new Stub(prop)
        }
    }

    const exposureProxy = new Proxy(exposed, exposedProxyHandler)

    parent[name] = exposureProxy;

}).apply({}, [this, undefined, true]);
;
;
class PointPen {


    constructor(point) {
        this.point = point;
    }

    _quickStroke(ctx, f, color, width=1, open=true, close=false) {
        open && ctx.beginPath()
        let r = f()

        let origStroke = ctx.strokeStyle
            , origWidth = ctx.lineWidth
            ;

        if(color != undefined) {
            ctx.strokeStyle = color == undefined? 'yellow': color
        }





        if(width != undefined) {
            ctx.lineWidth = width
        }

        close && ctx.closePath()

        ctx.stroke()
        ctx.strokeStyle = origStroke
        ctx.lineWidth = origWidth

        return r
    }

    ngon(ctx, sides, radius, fromCenter=true, color, width=1, angle=0, open=true, close=true) {
        return this._quickStroke(ctx, ()=>{
            let points = this.point.draw.ngon(ctx, sides, radius, fromCenter, angle)

        }, color, width, open, close)
    }

    circleGon(ctx, radius, lod=.3, fromCenter=true,color, width=1, open=true, close=true) {
        let sides = Number((radius * lod).toFixed())
        sides = Math.max(8, sides)
        return this.ngon(ctx, sides, radius, fromCenter, color, width, open, close)
    }

    line(ctx, otherPoint, color, width) {
        let al = arguments.length






        this._quickStroke(ctx, ()=>{
            if(otherPoint == undefined){
                otherPoint = this.point.project()
            }
            return this.point.draw.lineTo(ctx, otherPoint)
        }, color, width)
    }

    arc(ctx, otherPoint, color, distance=this.point.radius, width, direction=1) {

        this._quickStroke(ctx, ()=>{
            if(otherPoint == undefined){
                otherPoint = this.point.project()
            }
            let start = this.point.radians
            let end = otherPoint.radians
            this.point.draw.arc(ctx, distance, start, end, direction)

        }, color, width)
    }

    ellipse(ctx, other, color, radRotation=this.point.radians, strokeWidth=1) {
        let p = this.point
        let start = other.start ?? 0
        let end = other.end ?? 2 * Math.PI
         start = start - (other.relative? 0:  p.radians)
         end = end - (other.relative? 0:  p.radians)
        this._quickStroke(ctx, ()=>{
            this.point.draw.ellipse(ctx,
                    other.width, other.height,
                    r.radians,
                    start,
                    end)

        }, color, strokeWidth)
    }

    stroke(ctx, radius=undefined) {
        ctx.beginPath()
        this.point.draw.arc(ctx, radius)
        ctx.stroke()
    }

    circle(ctx, radius_or_conf=undefined, color, width) {


        let l = arguments.length
        let opts = {
            1: ()=>{

                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx)
                })
            }
            , 2: ()=>{

                const _color = radius_or_conf.color || ctx.strokeStyle
                const _width = radius_or_conf.width || ctx.lineWidth
                const _radius = radius_or_conf.radius || this.point.radius

                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx, _radius)
                }, _color , _width)
            }
            , 3: ()=>{

                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx, radius_or_conf)
                }, color , width)
            }
        }

        const extended = function(length) {
            return (length > 3) && opts[3]
        }
        let c = (opts[l]==undefined?extended(l):opts[l])()




    }

    fill(ctx, fillStyle=undefined, radius=undefined) {
        ctx.beginPath()

        this.point.draw.arc(ctx, radius)
        const getFillStyle = () => {
            if(fillStyle.color != undefined) {
                return fillStyle.color
            }

            if(fillStyle.fillStyle != undefined) {
                return fillStyle.fillStyle
            }

            return fillStyle
        };

        let fs = fillStyle == undefined? this.fillStyle || this.point.color: getFillStyle()

        if(fs) {
            ctx.fillStyle = fs.call? fs(this): fs
        }


        ctx.fill()
    }

    box(ctx, size=this.point.radius, color, width, angle){

        if(angle != undefined) {

            return this.ngon(ctx, 4, size * 1.4, true, color, width, angle)
        }
        let offset = {x: -size, y: -size}
        return this.rect(ctx, size*2, undefined, color, width, offset)
    }

    rect(ctx, width=this.point.radius, height, color, strokeWidth, offset={x:0, y:0}) {
        let xy = this.point.xy
        if(height == undefined) {
            height = width
        }
        this._quickStroke(ctx, ()=>{
           ctx.rect(xy.x + offset.x, xy.y + offset.y, width, height)

        }, color, strokeWidth)
    }

    roundRect(ctx, width=this.point.radius, height, color, strokeWidth, offset={x:0, y:0}, radii=[this.point.radius]) {
        let xy = this.point.xy
        if(height == undefined) {
            height = width
        }

        this._quickStroke(ctx, ()=>{

           ctx.roundRect(xy.x + offset.x, xy.y + offset.y, width, height, radii)
        }, color, strokeWidth)
    }

    indicator(ctx, miniConf={}) {








        let defaultCircleColor = '#66DD22'
        let defaultLineColor = defaultCircleColor
        let def = {
            line: { width: 2}
            , circle: { width: 1}
        };
        Object.assign(def, miniConf)

        let lc = def?.line?.color || def.color || this.point.color || defaultLineColor
        let lw = def?.line?.width || def.width
        let cc = def?.circle?.color || def?.color || def?.line?.color || this.point.color || defaultCircleColor
        let cw = def.width || def?.circle?.width

        this.point.project().pen.line(ctx, this.point, lc, lw,)
        this.circle(ctx, undefined,cc, cw,)
    }
}


Polypoint.head.install(PointPen)



Polypoint.head.lazyProp('Point', {
    pen() { return new PointPen(this) }
}, 'pen')


;
;
class PointDraw {


    constructor(point) {
        this.point = point;
    }

    arc(ctx, radius=undefined, start=0, end=Math.PI2, direction=1) {
        let p = this.point;
        let r = radius === undefined? p.radius: radius;
        ctx.arc(p.x, p.y, r<0?0:r, start, end, direction)
    }

    ellipse(ctx, rx,ry, radians, start=0, end=Math.PI2) {
        let p = this.point;
        let r = radians === undefined? p.radians: radians;

        ctx.ellipse(p.x, p.y, rx, ry, r, start, end)

    }

    circle(ctx, radius) {
        return this.arc(ctx, radius)
    }

    line(ctx, distance=this.point.radius) {

        debugger
    }

    hair(ctx, length) {

    }

    crossHair(ctx, length, sqeeeze=0, rotation){

    }

    lineTo(ctx, b) {
        let a = this.point;
        if(b != undefined) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
        }
    }

    box(ctx, size=this.point.radius, width, angle){

        if(angle != undefined) {

            return this.ngon(ctx, 4, size * 1.4, true, width, angle)
        }

        let offset = {x: -size, y: -size}
        return this.rect(ctx, size*2, width, offset)
    }


    rect(ctx, width=this.point.radius, height, offset={x:0, y:0}) {

        if(height==undefined) {
            height = width
        }


        let xy = this.point.xy
        ctx.rect(xy.x + offset.x, xy.y + offset.y, width, height)
    }

    roundRect(ctx, width=this.point.radius, height, radii=[10], offset={x:0, y:0}) {



        if(height==undefined) {
            height = width
        }
        let p = this.point
        ctx.roundRect(p.x + offset.x, p.y + offset.y, width, height, radii)

    }

    ngon(ctx, sides, radius, fromCenter=true, angle=0) {



        let p = this.point;
        let r = radius === undefined? p.radius: radius;

        if(fromCenter) {
            p = p.add(-r)
        }


        let points = getPolyDistributedPoints(sides, p, r, angle)
        let p0 = points[0]

        ctx.moveTo(p0.x, p0.y)

        for (let i = 1; i <= points.length - 1; i++) {
            let p = points[i]
            ctx.lineTo(p.x, p.y);
        }
        return points
    }

}


Polypoint.head.install(PointDraw)


Polypoint.head.lazyProp('Point', {
    draw() {
        let r = this._draw
        if(r == undefined) {
            r = new PointDraw(this)
            this._draw = r
        }
        return r
    }
})

;
;

Number.EPSILON = Math.pow(2, -52);
Math.sign = function(x) {
    return ((x > 0) - (x < 0)) || +x;
};



const vectorAngle = (x, y) =>{


  Math.acos(
    x.reduce((acc, n, i) => acc + n * y[i], 0) /
      (Math.hypot(...x) * Math.hypot(...y))
  );

}

const applyAngle = function(s) {

    let obtuseOffset = 10;
    let offset = 20;














    let ang1 = s.position.protractorAngleTo(s.end, s.mid)

    let ajl = ang1.protractorRotate(180)
    if(ang1 > 180) {
        ajl = 360 - ajl
    }

    let oa = ang1 < 0? obtuseOffset: 0;
    let ob = ang1 > 0? obtuseOffset: 0;

    drawArcThroughPoint(a, s.position, s.end, s.mid, offset + oa)
    a.sweepFlag = +(ang1 > 0)




}

const drawArcThroughPoint = function(arc, start, end, mid, offset=20) {
    let offsetPlus = 0
    mid = new Point(mid)


    let o4 = start.interpolateTo(mid, offset + offsetPlus, 1)
    let o3 = mid.interpolateTo(end, offset + offsetPlus, 0)
    let po4 = new Point(o4)

    if(po4.isNaN(true)) { return }
    arc.options.rx = arc.options.ry = offset + offsetPlus

    arc.position.copy(o4)
    arc.end.copy(o3)
    arc.render()
}



let quantizeT = function(s, t, rect){

    let endX = t.clientX - rect.x
    let endY = t.clientY - rect.y

    if(s.settings.quantizeTip != undefined) {
        endY = quantizeNumber(endY, s.settings.quantizeTip)
        endX = quantizeNumber(endX, s.settings.quantizeTip)
    }

    return [endX, endY]
}















const spotPlacement = function(s, offset) {
        let d = distance(s.position, s.end)
        offset = offset == undefined ? (d * -.02): offset
        let off = findOffsetPoint(s.position, s.end, offset)
        c.width = 5

        c.position.set(off)
        c.render()
}


function findOffsetPoint(point1, point2, offsetDistance=10) {

  const dist = distance(point1, point2);
  const ux = (point2.x - point1.x) / dist;
  const uy = (point2.y - point1.y) / dist;


  const px = -uy;
  const py = ux;


  const mx = (point1.x + point2.x) / 2;
  const my = (point1.y + point2.y) / 2;


  const cx = mx + offsetDistance * px;
  const cy = my + offsetDistance * py;

  res = { x: cx, y: cy };

  return res
}




function calculateFirstSegmentOffsetFromEndWithNeg(start, end) {

  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );


  const d = distanceAB / (1 + Math.sqrt(2));

  const dx = end.x - start.x
  const dy = end.y - start.y
  console.log(dx,dy)

  const directionX = (dx >= 0) ? 1 : -1;
  const directionY = (dy >= 0) ? 1 : -1;



  let offsetX;
  if (directionX === 1 && directionY === 1) {
    return end.x - d;
  }

  if (directionX === -1 && directionY === -1) {
    return end.x + d;
  }

  if (directionX === 1 && directionY === -1) {
    return end.x - d;
  }

  if (directionX === -1 && directionY === 1) {
    return end.x + d;
  }

  return offsetX;
}


function calculateFirstSegmentOffsetFromEndWithNegY(start, end, k='y') {


  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );


  const d = distanceAB / (1 + Math.sqrt(2));


  const directionX = (end.x - start.x >= 0) ? 1 : -1;
  const directionY = (end.y - start.y >= 0) ? 1 : -1;


  const directionK = (k === 'x') ? directionX : directionY;


  const endK = end[k];


  const offsetK = directionK === 1 ? (endK - d) : (endK + d);

  return offsetK;
}


function calculateFirstSegmentOffsetFromEndA(start, end, outputAngle=90) {

  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );


  let angleInRadians = Math.atan2(end.y - start.y, end.x - start.x);


  let angleInDegrees = angleInRadians * (180 / Math.PI);


  angleInDegrees = (angleInDegrees + 360) % 360;


  const adjustedAngle = (angleInDegrees + outputAngle) % 360;




  const d = distanceAB / (Math.cos(adjustedAngle * (Math.PI / 180)) + Math.sin(adjustedAngle * (Math.PI / 180)));


  const offsetX = end.x - d * Math.cos(angleInDegrees * (Math.PI / 180));

  return offsetX;
}


function calculateFirstSegmentOffsetFromEnd(start, end) {

  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );


  const d = distanceAB / (1 + Math.sqrt(2));


  const offsetX = end.x - d;

  return offsetX;
}


function calculateFirstSegmentLength(start, end) {

  const distanceAB = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );


  const d = distanceAB / (1 + Math.sqrt(2));

  return d;
}


function quantizeNumber(value, quantize=1) {
  const quantizedValue = Math.round(value / quantize) * quantize;
  return quantizedValue;
}


function findRadius(pointA, pointB, pointC) {









    const a = distance(pointB, pointC);
    const b = distance(pointC, pointA);
    const c = distance(pointA, pointB);

    const s = a + b + c;

    const radius = (a * b * c) / Math.sqrt(s * (s - 2 * a) * (s - 2 * b) * (s - 2 * c));

    return radius;
}







function quantizeAngle(inputAngle, bisect) {



  inputAngle = inputAngle % 360;
  if (inputAngle < 0) {
    inputAngle += 360;
  }


  const sectorSize = 360 / bisect;


  const closestAngle = Math.round(inputAngle / sectorSize) * sectorSize;


  return closestAngle % 360;
}


function calculateAngle(point1, point2) {

    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;


    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    angleInDegrees = (angleInDegrees + 360) % 360;
    return angleInDegrees;
}

function calculateAngleWithRef(point1, point2, referencePoint) {


  const refDeltaX = point1.x - referencePoint.x;
  const refDeltaY = point1.y - referencePoint.y;
  let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
  refAngleInDegrees = (refAngleInDegrees + 360) % 360;


  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angleInDegrees = (angleInDegrees + 360) % 360;


  let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;


  relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;

  return relativeAngleInDegrees;
}


function calculateAngleWithRefNegMirror(point1, point2, referencePoint) {



    const refDeltaX = point1.x - referencePoint.x;
    const refDeltaY = point1.y - referencePoint.y;
    let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
    refAngleInDegrees = (refAngleInDegrees + 360) % 360;


    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angleInDegrees = (angleInDegrees + 360) % 360;


    let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;


    relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;


    if (relativeAngleInDegrees > 180) {
      relativeAngleInDegrees = 360 - relativeAngleInDegrees;
    }

    return relativeAngleInDegrees;
}


function calculateAngleWithRefWithNeg(point1, point2, referencePoint) {


  const refDeltaX = point1.x - referencePoint.x;
  const refDeltaY = point1.y - referencePoint.y;
  let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
  refAngleInDegrees = (refAngleInDegrees + 360) % 360;


  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angleInDegrees = (angleInDegrees + 360) % 360;


  let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;


  relativeAngleInDegrees = (relativeAngleInDegrees + 360) % 360;


  if (relativeAngleInDegrees > 180) {
    relativeAngleInDegrees = relativeAngleInDegrees - 360;
  }

  return relativeAngleInDegrees;
}


function adjustAngleToPreferredRotation(relativeAngle, preferredRotation) {

  relativeAngle = (relativeAngle + 360) % 360;
  preferredRotation = (preferredRotation + 360) % 360;


  let adjustedAngle = preferredRotation - relativeAngle;


  adjustedAngle = (adjustedAngle + 360) % 360;

  return adjustedAngle;
}


function findOffsetPoint(point1, point2, offsetDistance=10) {

  const dist = distance(point1, point2);
  const ux = (point2.x - point1.x) / dist;
  const uy = (point2.y - point1.y) / dist;


  const px = -uy;
  const py = ux;


  const mx = (point1.x + point2.x) / 2;
  const my = (point1.y + point2.y) / 2;


  const cx = mx + offsetDistance * px;
  const cy = my + offsetDistance * py;

  res = { x: cx, y: cy };

  return res
}


function getOffsetPoint(pointA, pointB, percentage, fromPoint) {
  if (fromPoint === 1) {
    [pointA, pointB] = [pointB, pointA];
  }

  const x = (1 - percentage) * pointA.x + percentage * pointB.x;
  const y = (1 - percentage) * pointA.y + percentage * pointB.y;

  return { x, y };
}


function getPointOffsetAbsolute(pointA, pointB, distance, fromPoint) {

    if (fromPoint === 1) {
      [pointA, pointB] = [pointB, pointA];
    }


    const dirX = pointB.x - pointA.x;
    const dirY = pointB.y - pointA.y;


    const length = Math.sqrt(dirX * dirX + dirY * dirY);


    const normX = dirX / length;
    const normY = dirY / length;


    const offsetX = normX * distance;
    const offsetY = normY * distance;


    const x = pointA.x + offsetX;
    const y = pointA.y + offsetY;

    return { x, y };
  }














function linePathArray(start, end, gap = 10, rotation = 0) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;


    const cosTheta = Math.cos(toRadians(rotation));
    const sinTheta = Math.sin(toRadians(rotation));


    const extra = Math.abs((end.y - start.y) * sinTheta) + Math.abs((end.x - start.x) * cosTheta);


    const adjustedStartX = start.x - extra;
    const adjustedEndX = end.x + extra;

    const numLines = Math.ceil((adjustedEndX - adjustedStartX) / gap);

    let pathData = '';

    for (let i = 0; i <= numLines; i++) {

        const baseX = adjustedStartX + i * gap;
        const baseY = start.y;


        const x1 = baseX;
        const y1 = baseY;
        const x2 = baseX - (end.y - start.y) * sinTheta;
        const y2 = baseY + (end.y - start.y) * cosTheta;



        if ((x1 >= start.x && x1 <= end.x && y1 >= start.y && y1 <= end.y) ||
            (x2 >= start.x && x2 <= end.x && y2 >= start.y && y2 <= end.y)) {
            pathData += `M${x1} ${y1} L${x2} ${y2} `;
        }
    }

    return pathData;
}


function linePathArray2(start, end, gap = 10, rotation = 0) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    function lineIntersectRect(m, c, start, end) {
        let left = { x: start.x, y: m * start.x + c };
        let right = { x: end.x, y: m * end.x + c };
        let top = { x: (start.y - c) / m, y: start.y };
        let bottom = { x: (end.y - c) / m, y: end.y };

        let points = [left, right, top, bottom];
        let validPoints = points.filter(pt => pt.x >= start.x && pt.x <= end.x && pt.y >= start.y && pt.y <= end.y);
        validPoints.sort((a, b) => a.x - b.x || a.y - b.y);

        if (validPoints.length < 2) return null;
        return [validPoints[0], validPoints[validPoints.length - 1]];
    }

    const m = Math.tan(toRadians(rotation));
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    let pathData = '';


    let centralC = centerY - m * centerX;
    let segment = lineIntersectRect(m, centralC, start, end);
    if (segment) {
        pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
    }


    let i = 1;
    while (i < 3000) {
        const d = gap * i;
        let validSegments = 0;

        if(validSegments > 500) {
            break
        }

        let c1 = centerY - m * (centerX - d);
        segment = lineIntersectRect(m, c1, start, end);
        if (segment) {
            validSegments++;
            pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
        }


        let c2 = centerY - m * (centerX + d);
        segment = lineIntersectRect(m, c2, start, end);
        if (segment) {
            validSegments++;
            pathData += `M${segment[0].x} ${segment[0].y} L${segment[1].x} ${segment[1].y} `;
        }


        if (validSegments === 0) break;
        i++;
    }

    return pathData;
}


function linePathArray3(start, end, gap = 10, rotation = 0, offset = 0) {
    function rotatePoint(px, py, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        return {
            x: px * c - py * s,
            y: px * s + py * c
        };
    }

    const radianRotation = rotation * (Math.PI / 180);
    let pathData = '';
    const width = end.x - start.x;
    const height = end.y - start.y;
    const maxDist = Math.sqrt(width * width + height * height);
    const steps = maxDist / gap;
    if(typeof(offset) == 'number'){
        offset = {x: offset, y: offset}
    }

    const ofs = function(v) {
        let r = (v % ( gap - 2))
        return r + 2
    }

    Object.assign(offset, {
            oX: ofs(offset.x)
            , oY: ofs(offset.y)
        })



    for (let i = -steps; i <= steps; i++) {

        let p1 = { x: -maxDist, y: i * gap };
        let p2 = { x: maxDist, y: i * gap };


        p1 = rotatePoint(p1.x, p1.y, radianRotation);
        p2 = rotatePoint(p2.x, p2.y, radianRotation);


        p1.x += ((start.x + end.x) * .5) + offset.oX;
        p1.y += ((start.y + end.y) * .5) + offset.oY;
        p2.x += ((start.x + end.x) * .5) + offset.oX;
        p2.y += ((start.y + end.y) * .5) + offset.oY;



        const clippedLine = clipLineToRect(p1, p2, start, end);
        if (clippedLine) {
            pathData += `M${clippedLine[0].x} ${clippedLine[0].y} L${clippedLine[1].x} ${clippedLine[1].y} `;
        }
    }

    return pathData;
}


function clipLineToRect(p0, p1, topLeft, bottomRight) {

    const INSIDE = 0;
    const LEFT = 1;
    const RIGHT = 2;
    const BOTTOM = 4;
    const TOP = 8;

    const computeOutCode = (x, y, topLeft, bottomRight) => {
        let code = INSIDE;

        if (x < topLeft.x) code |= LEFT;
        else if (x > bottomRight.x) code |= RIGHT;
        if (y < topLeft.y) code |= TOP;
        else if (y > bottomRight.y) code |= BOTTOM;

        return code;
    };

    let outcode0 = computeOutCode(p0.x, p0.y, topLeft, bottomRight);
    let outcode1 = computeOutCode(p1.x, p1.y, topLeft, bottomRight);
    let accept = false;

    while (true) {
        if (!(outcode0 | outcode1)) {
            accept = true;
            break;
        } else if (outcode0 & outcode1) {
            break;
        } else {
            let x, y;
            const outcodeOut = outcode0 ? outcode0 : outcode1;

            if (outcodeOut & TOP) {
                x = p0.x + (p1.x - p0.x) * (topLeft.y - p0.y) / (p1.y - p0.y);
                y = topLeft.y;
            } else if (outcodeOut & BOTTOM) {
                x = p0.x + (p1.x - p0.x) * (bottomRight.y - p0.y) / (p1.y - p0.y);
                y = bottomRight.y;
            } else if (outcodeOut & RIGHT) {
                y = p0.y + (p1.y - p0.y) * (bottomRight.x - p0.x) / (p1.x - p0.x);
                x = bottomRight.x;
            } else if (outcodeOut & LEFT) {
                y = p0.y + (p1.y - p0.y) * (topLeft.x - p0.x) / (p1.x - p0.x);
                x = topLeft.x;
            }

            if (outcodeOut === outcode0) {
                p0 = { x, y };
                outcode0 = computeOutCode(p0.x, p0.y, topLeft, bottomRight);
            } else {
                p1 = { x, y };
                outcode1 = computeOutCode(p1.x, p1.y, topLeft, bottomRight);
            }
        }
    }

    if (accept) {
        return [p0, p1];
    } else {
        return null;
    }
}






function findLineCircleIntersections(p0, p1, cx, cy, radius) {
    let dx = p1.x - p0.x;
    let dy = p1.y - p0.y;
    let A = dx * dx + dy * dy;
    let B = 2 * (dx * (p0.x - cx) + dy * (p0.y - cy));
    let C = (p0.x - cx) * (p0.x - cx) + (p0.y - cy) * (p0.y - cy) - radius * radius;
    let det = B * B - 4 * A * C;

    if (det < 0 || A === 0) {
        return [];
    } else if (det === 0) {

        let t = -B / (2 * A);
        return [{ x: p0.x + t * dx, y: p0.y + t * dy }];
    } else {

        let t1 = (-B + Math.sqrt(det)) / (2 * A);
        let t2 = (-B - Math.sqrt(det)) / (2 * A);
        return [
            { x: p0.x + t1 * dx, y: p0.y + t1 * dy },
            { x: p0.x + t2 * dx, y: p0.y + t2 * dy }
        ];
    }
}


function drawGridInCircle(center, radius, gap, rotation, startOffset) {
    let angleRad = (rotation * Math.PI) / 180;
    let pathData = "";


    let distantPoint = {
        x: center.x + 2 * radius * Math.cos(angleRad),
        y: center.y + 2 * radius * Math.sin(angleRad)
    };

    for (let offset = -2 * radius; offset < 2 * radius; offset += gap) {
        let start = {
            x: center.x + offset * Math.sin(-angleRad),
            y: center.y + offset * Math.cos(-angleRad)
        };
        let end = {
            x: start.x + distantPoint.x - center.x,
            y: start.y + distantPoint.y - center.y
        };

        let intersections = findLineCircleIntersections(start, end, center.x, center.y, radius);
        if (intersections.length === 2) {
            pathData += `M${intersections[0].x} ${intersections[0].y} L${intersections[1].x} ${intersections[1].y} `;
        }
    }

    return pathData.trim();
}





;
;
Math.PI2 = Math.PI * 2
const TAU = 2 * Math.PI;

const RIGHT = 0
const DOWN = Math.PI*.5;
const LEFT = Math.PI * 1;
const UP = Math.PI*1.5;

const RIGHT_DEG = radiansToDegrees(0);
const DOWN_DEG = radiansToDegrees(Math.PI *.5);
const LEFT_DEG = radiansToDegrees(Math.PI  * 1);
const UP_DEG = radiansToDegrees(Math.PI *1.5);


class Compass {

    constructor(setup={}) {
        this.func = setup.func
    }

    setDeg() {
        this.func = radiansToDegrees
    }

    setRad() {
        this.func = undefined;
    }

    static degrees() {
        return new Compass({
            func: radiansToDegrees
        })
    }

    static get rad() {
        return new Compass()
    }

    get(v) {
        return this.conv(v)
    }

    get right(){
         return this.conv(0)
    }

    get down(){
         return this.conv(Math.PI *.5)
    }

    get left(){
         return this.conv(Math.PI * 1)
    }

    get up(){
         return this.conv(Math.PI * 1.5)
    }

    conv(v) {
        if(this.func) {
            return this.func(v)
        }
        return v
    }
}


function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}


const radiansToTau = function(radians) {

    return radians / TAU;
}


const degToRad = function(value) {
    return value * (Math.PI / 180);
}


function projectFrom(origin, distance=undefined, rotation=undefined) {

    if(rotation === undefined) {
        rotation = origin.rotation
    }

    if(distance === undefined) {
        distance = origin.radius
    }

    const rotationInRadians = degToRad(rotation)


    const x = origin.x + distance * Math.cos(rotationInRadians);
    const y = origin.y + distance * Math.sin(rotationInRadians);

    return { x, y };
}

Polypoint.head.install(Compass)


Polypoint.head.deferredProp('Stage', function compass(){
    return Compass.degrees()
})


;
;

let centerOfMass = {
    simple(points, origin) {

        let total = point(0,0)
        if(origin) total.add(origin);

        points.forEach((p) => {
            total = total.add(p)
        })

        return total.divide(points.length);
    }
    , deep(points, origin)  {
        let totalMass = 0;
        let weightedSum = point(0, 0);
        if(origin) weightedSum.add(origin);

        let sinSum = 0;
        let cosSum = 0;

        points.forEach((p) => {
            let mass = p.radius;
            totalMass += mass;
            weightedSum = weightedSum.add(p.multiply(mass));

            let theta = p.radians
            sinSum += Math.sin(theta) * mass;
            cosSum += Math.cos(theta) * mass;
        });

        let center = weightedSum.divide(totalMass);


        let avgTheta = Math.atan2(sinSum / totalMass, cosSum / totalMass);
        center.rotation = avgTheta * 180 / Math.PI;
        center.radius = center.mass = totalMass;
        return center
    }

    , deepRotationAddition(points, origin) {

        let totalMass = 0;
        let weightedSum = point(0,0)
        if(origin) weightedSum.add(origin);

        let weightedSumRotation = 0;

        points.forEach((p)=>{
            let mass = p.radius;
            totalMass += mass;
            weightedSum = weightedSum.add(p.multiply(mass))
            weightedSumRotation += p.rotation * mass
        })

        let center = weightedSum.divide(totalMass)

        center.rotation = weightedSumRotation / totalMass;
        center.radius = center.mass = totalMass

        return center
    }
}


;
;
Math.PI2 = Math.PI * 2









const polyGen = function(ctx, count, point, radius) {

    let points = getPolyDistributedPoints(count, point, radius)
    let p0 = points[0]

    ctx.beginPath();

    ctx.moveTo(p0.x, p0.y)

    for (i = 1; i <= points.length - 1; i++) {
        let p = points[i]
        ctx.lineTo(p.x, p.y);
    }

}


const getPolyDistributedPoints = function(count, pos, radius, rads=0, angle) {

    radius = radius == undefined? pos.radius: radius;
    let {x, y} = pos.add(radius);

    let res = []

    const c2pi = Math.PI2 / count

    for (let i = 0; i < count; i++) {
        let i2pic = (i * c2pi) + rads;
        let p = point(
                x + radius * Math.cos(i2pic),
                y + radius * Math.sin(i2pic)
            );

        p.radians = i2pic + (angle == undefined? 0: angle)
        res.push(p)
    }

    return res
}


function projectFrom(origin, distance=undefined, rotation=undefined) {

    if(rotation === undefined) {
        rotation = origin.rotation
    }

    if(distance === undefined) {
        distance = origin.radius
    }






    const vector = getVector(degToRad(rotation), distance)
    const x = origin.x + vector.x;
    const y = origin.y + vector.y;

    return { x, y };
}

;
;

let tryInheritColor = function(item, v) {
    if(v == 'inherit') {
        return item.color || undefined
    }
    return v
}


class PointListPen {

    constructor(pointList) {
        this.pointList = pointList;
    }

    points(ctx, cb) {
        let defaultF = (x)=>{

            x.draw.arc(ctx)

        }
        if(cb == undefined) {
            cb = (x,f)=>f(x)
        }

        this.pointList.forEach((x)=>{
            cb(x, defaultF)
        })
    }

    line(ctx, color_or_conf, b) {
        this.pointList.draw.line.apply(this.pointList.draw, arguments)



        let l = arguments.length
        let opts = {
            1: ()=>{

                const col = ctx.strokeStyle
                const width = ctx.lineWidth
                quickStrokeWithCtx(ctx, col, width)
            }
            , 2: ()=>{

                const col = color_or_conf.color || ctx.strokeStyle
                const width = color_or_conf.width || ctx.lineWidth
                quickStrokeWithCtx(ctx, col, width)
            }
            , 3: ()=>{

                quickStrokeWithCtx(ctx, color_or_conf, b)
            }
        }

        let c = opts[l]()

    }

    lines(ctx, color='inherit', width) {


        let lc = color?.line?.color || color.color || color
        let lw = color?.line?.width || color.width || width

        let eachPoint = (item, arcDrawF) =>{
                item.project().pen.line(ctx, item, tryInheritColor(item, lc), lw)
                ctx.beginPath();


            }

        this.points(ctx, eachPoint)
    }

    indicator() {
        return this.indicators.apply(this, arguments)
    }

    indicators(ctx, miniConf={}) {


        let defaultCircleColor = 'inherit'
        let defaultLineColor = defaultCircleColor
        let def = {
            line: { width: 2}
            , circle: { width: 1}
        };
        Object.assign(def, miniConf)

        let lc = def?.line?.color || def.color || defaultLineColor
        let lw = def?.line?.width || def.width
        let cc = def?.circle?.color || def?.color || def?.line?.color || defaultCircleColor
        let cw = def.width || def?.circle?.width


        let eachPoint = (item, arcDrawF) =>{
                item.project().pen.line(ctx, item, tryInheritColor(item, lc), lw)
                ctx.beginPath();
                arcDrawF(item)
                quickStrokeWithCtx(ctx, tryInheritColor(item, cc), cw)
            }

        this.points(ctx, eachPoint)
    }

    fill(ctx, fillStyle, radius=undefined) {
        ctx.beginPath()
        let fs = fillStyle || this.color
        if(fs) {ctx.fillStyle = fs};

        this.points(ctx, (p)=> p.pen.fill(ctx, fs, radius))



        ctx.fill()
    }

    flood(ctx, fillStyle, draw='quadCurve', ...drawArgs) {

        let keep;
        if(fillStyle) {
            keep = ctx.fillStyle
            ctx.fillStyle = fillStyle
        }

        if(draw != undefined || draw != false || draw != null) {
            this.pointList.draw[draw](ctx, ...drawArgs)
        }

        ctx.fill()

        if(keep != undefined) {
            ctx.fillStyle = keep
        }
    }

    stroke(ctx) {

        let args = arguments;
        this.points(ctx, (p)=> p.pen.stroke.apply(p.pen, args))
    }

    circle(ctx, radius=undefined, color, width) {
        let args = arguments;
        this.points(ctx, (p)=> p.pen.circle.apply(p.pen, args))

    }

    quadCurve(ctx, color_or_conf, loop=false, position){

        const data = unpack(arguments, {
            color: color_or_conf,
            lineWidth: UNSET,
            loop,
            position,
        });

        this.pointList.draw.quadCurve(ctx, data.loop, data.position)
        quickStrokeWithCtx(ctx, data.color, data.lineWidth)

    }
}


Polypoint.head.install(PointListPen)

;
;
class PointListDraw {

    constructor(list) {
        this.list = list;
    }

    horizonLine(ctx) {


        let a = this.list[0]
        let b = this.list.last()
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
    }

    stroke(ctx) {

        let args = arguments;
        this.list.forEach((p)=> p.draw.stroke.apply(p.draw, args))
    }

    circle(ctx, radius=undefined, color, width) {
        let args = arguments;
        this.list.forEach((p)=> p.draw.circle.apply(p.draw, args))

    }


    pointLine(ctx, position, loop=false) {

        let pointsArray = this.list
        let a = pointsArray[0]
        if(!a) { return }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)

        let {x, y} = position? position: {x:0, y:0}

        for(let i=1; i < pointsArray.length; i++) {
            let segment = pointsArray[i]
            ctx.lineTo(segment.x + x, segment.y + y);
        }
        if(loop==true) {
            ctx.lineTo(a.x, a.y);
        }

    }


    line(ctx, conf={}) {
        return this.pointLine(ctx, undefined, conf.loop == undefined? conf.closed: conf.loop)
    }

    quadCurve(ctx, loop=false, position){

        let pointsArray = this.list;
        let prevPoint = pointsArray[0];
        position = position? position: prevPoint
        let numPoints = pointArray.length;
        let p0 = pointsArray[numPoints - 1] || position;
        let _p2 = prevPoint;
        let strength = .5
        if(p0 ==  undefined) {return}
        ctx.beginPath();
        let min1 = prevPoint
        if(loop) {

            min1 = pointsArray.last()
        }

        ctx.moveTo( (p0.x + min1.x) * strength, (p0.y + min1.y) * strength );

        for(let i = 1; i < pointsArray.length; i++) {

            let currPoint = pointsArray[i];
            var xc = (prevPoint.x + currPoint.x) * strength;
            var yc = (prevPoint.y + currPoint.y) * strength;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
            prevPoint = currPoint;
        }


        var xc = (prevPoint.x + prevPoint.x) * strength;
        var yc = (prevPoint.y + prevPoint.y) * strength;

        if(loop) {
            xc = (prevPoint.x + _p2.x) * strength;
            yc = (prevPoint.y + _p2.y) * strength;
        }

        if(loop!=2){
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        }
    }

}


Polypoint.head.install(PointListDraw)

;
;
class PointListGradient {

    constructor(parent) {
        this.parent = parent;
    }

    linear(ctx) {


        let parent = this.parent;
        let prev = parent[0]

        let distances = [[0, prev.color]];
        let total = 0;
        let round = Math.round;

        for (var i = 1; i < parent.length; i++) {
            let distance = round(parent[i].distanceTo(prev))
            distances.push([distance, prev.color])
            total += distance
            prev = parent[i]
        };

        let stops = []
        let running = 0
        for (var i = 0; i < distances.length; i++) {
            let v = distances[i]
            let dis = v[0]
            let r = (dis / total)
            let stop = Number((r + running).toFixed(4))
            stops.push([stop, v[1]])
            running += r
        }

        let a = parent[0]
        let b = parent.last()
        let gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        for (var i = 0; i < stops.length; i++) {
            let stop = stops[i]
            gradient.addColorStop(stop[0], stop[1]);
        }
        return gradient;
    }
}


Polypoint.head.install(PointListGradient)

;
;

class PointListShape {


    constructor(parent) {
        this.parent = parent;
    }

    get length(){
        return this.parent.length
    }

    linear(spread, keys=['x'], altValue=undefined, altKeys=['x','y']) {


        if(typeof(keys) == 'string') {
            keys = [keys]
        }

        let doAlt = altValue != undefined;
        let items = this.parent
        let eachFunc = function(e,i,a){
            for(let k of keys) {
                e[k] = spread * i
            }

            if(!doAlt) {
                return
            }

            for(let k of altKeys) {

                if(keys.indexOf(k) > -1) {
                    continue
                }
                e[k] = altValue;
            }
        }
        items.forEach(eachFunc)
    }

    random(multiplier=100) {

        let items = this.parent
        let R = ()=> Math.random() * multiplier

        items.forEach((e, i, a)=>{

            e.x = R()
            e.y = R()
            return e
        })

        return items
    }

    grid(spread, rowCount=10, pos) {

        let items = this.parent
        pos = pos || items[0].copy()
        items.forEach((e, i, a)=>{
            e.x = pos.x + ( spread * (i % rowCount))
            e.y = pos.y + ( Math.floor(i / rowCount) * spread )
        })

        return new GridTools(this.parent, rowCount, pos)
    }

    radial(point, radius){


       throw Error('NotImplemented')
    }

    radius(radius, pos) {

        const items = this.parent;
        pos = pos || point(items[0]).copy()
        radius = radius == undefined? pos.radius: radius;






        const count = items.length
        const c2pi = Math.PI2 / count

        for(let i = 0; i <= count-1; i++) {
            let i2pic = i * c2pi;
            let p = items[i]
            p.x = radius * Math.cos(i2pic) + pos.x
            p.y = radius * Math.sin(i2pic) + pos.y


        }


    }
}

;
;
class GridTools {

    constructor(parent, width, pos) {
        this.parent = parent;
        this.width = width;
        this.initPosition = pos;
    }


    getColumn(index) {
        if(index<0) {

            index = this.width + index
        }

        let items = new PointList()
        let modIndex = index % this.width
        for (var i = 0; i < this.parent.length; i+=this.width) {
            let l = this.getRow(i)
            items.push(l[modIndex])
        }

        return items
    }

    getRow(i){
        return this.parent.slice(i, i+this.width)
    }


    getRect(){}

    subdivide(split=1, mutate=true) {


    }



    getSiblings(index, columnCount=this.width, rowCount, total, expand=false) {
        let rc = rowCount==undefined? columnCount: rowCount
        total = total == undefined? rc * columnCount: total

        const currentRow = Math.floor(index / columnCount)
            , currentColumn = index % columnCount
            , size  = total

            , up    = index - columnCount
            , left  = index - 1
            , right = index + 1
            , down  = index + columnCount
            , res = {}

            ;


        const inBounds = (v) => (v >= 0) && (v < total);
        const boundPush = (n, v) => {
            if(inBounds(v)) {
                res[n] = v

            }};

        boundPush('up', up);
        boundPush('down', down);


        let leftCol = left % total;
        let leftRow = Math.floor(left / columnCount);
        (currentRow == leftRow) && boundPush('left', left);

        (currentColumn != columnCount-1) && boundPush('right', right);

        if(expand) {
            return res;
        }

        return Object.values(res).sort()
    }

    getSiblings8(index, columnCount = this.width, rowCount, total) {

        const rc = (rowCount == null) ? columnCount : rowCount;

        total = (total == null) ? rc * columnCount : total;

        const currentRow    = Math.floor(index / columnCount);
        const currentColumn = index % columnCount;
        const res           = [];


        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {

              if (rowOffset === 0 && colOffset === 0) continue;

              const newRow    = currentRow    + rowOffset;
              const newColumn = currentColumn + colOffset;


              if (newRow >= 0 && newRow < rc && newColumn >= 0 && newColumn < columnCount) {
                const neighborIndex = newRow * columnCount + newColumn;

                if (neighborIndex >= 0 && neighborIndex < total) {
                  res.push(neighborIndex);
                }
              }
            }
        }

        return res.sort((a, b) => a - b);
    }
}



class PointListGenerator {

    constructor(parent) {
        this.parent = parent;

    }

    _distanceToPointFunction(distance) {

        let f = (i) => {
            return point(0, distance*i);
        }

        if(isPoint(distance)) {

            f = (i) => {
                return distance.multiply(i)
            }

            return f
        }

        if(isFunction(distance)) {
            return distance
        }

        return f;
    }

    radius(count, radius, origin) {


        let res = this.random(count)

        res.shape.radius(radius, origin)
        return res

    }

    countOf(count) {


        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        for(let i = 0; i<=count-1; i++){
            let p = new Point;
            res.push(p)
        }
        return res
    }

    list(count=5, distance=10, origin=undefined) {


        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        let f = this._distanceToPointFunction(distance)
        for(let i = 0; i<=count-1; i++){
            let p = f(i)
            res.push(p)
        }

        origin && res.offset(origin)
        return res
    }

    random(count, multiplier=100, offset={x:0, y:0, radius: 0, rotation: 0}) {

        if(typeof(count) != 'number') {

            if(count.multiplier) {
                multiplier = count.multiplier
            }

            if(count.offset) {
                offset = count.offset
            }

            if(count.count) {
                count = count.count
            } else {
                count = this.parent.length
            }
        }
        let multiplierP = new Point(multiplier)
        let offsetP = new Point(offset)
        let R = (w)=> Math.random() * multiplierP[w]

        let doRads = multiplierP.radius != null
        let doRotation = multiplierP.rotation != null

        const rand = function(index) {

            const opts = {
                x: offsetP.x + R('x')
                , y: offsetP.y + R('y'),
            }

            doRads && (opts['radius'] = offsetP.radius + R('radius'))
            doRotation && (opts['rotation'] = offsetP.rotation + R('rotation'))
            return new Point(opts)
        }

        return this.list(count, rand)
    }

    grid(pointCount, rowCount, pointSpread, gridPosition) {
        let d = unpack0(arguments, {
            count: null
            , rowCount: 10
            , spread: undefined
            , position: undefined
        })

        let points = this.list(d.count)
        let spread = d.spread
        let pos = d.position

        if(spread==undefined) {
            spread = d.count;
        }

        if(pos == undefined){
            pos = {x: spread, y: spread}
        }

        this._gridTool = points.shape.grid(spread, d.rowCount, pos)
        return points;
    }

    getGridTool(rowCount, pos) {
        if(this._gridTool == undefined) {
            this._gridTool = new GridTools(this.parent, rowCount, pos)
        }

        return this._gridTool
    }
}


Polypoint.head.install(PointListGenerator)

;
;
const unpack = function(args, defaults) {


    let l = args.length


    let m = {
        0: ()=> {

            return defaults
        }
        , 1: ()=>{


            return defaults
        }
        , 2: ()=> {




            return Object.assign({}, defaults, args[1])
        }

    }[l];

    if(m) { return m() }


    console.log('>2 args, unpack')

    let item = Object.entries(defaults)
    let res = Object.assign(defaults)

    for (let i = 1; i < args.length; i++) {






        let key = item[i-1][0]
           , v = args[i];
        if(args[i] === NULLY) {
            v = defaults[key]
        };
        res[key] = v
    }

    return res;
}

const unpack0 = function(args, defaults) {


    let l = args.length
    let offset = 0


    let m = {
        0: ()=> {
            console.log('no args')
            return defaults
        }
        , 1: ()=> {

            console.log('2 args, return [1]')


            return Object.assign({}, defaults, args[offset])
        }

    }[l];

    if(m) { return m() }


    console.log('>2 args, unpack')

    let item = Object.entries(defaults)
    let res = Object.assign(defaults)
    for (let i = offset; i < args.length; i++) {






        let key = item[i-offset][0]
           , v = args[i];
        if(args[i] === NULLY) {
            v = defaults[key]
        };
        res[key] = v
    }

    return res;
}

const NULLY = null

const runUnpack = function(){
    return unpack(arguments, {})
}


const callRunUnpackLarge = function() {

    const ctx = {}


    let a = runUnpackLarge(ctx)
    assert(a.sides == 7)
    assert(a.radius == undefined)



    a = runUnpackLarge(ctx, {
                sides: 33
                , radius: 10
                , fromCenter: false
                , color: 'green'

                , angle: 20


            })
    assert(a.sides == 33)
    assert(a.radius == 10)


    a = runUnpackLarge(ctx, {
        horse: 'tall'
    })

    assert(a.sides == 7)
    assert(a.radius == undefined)
    assert(a.horse == 'tall')


    a = runUnpackLarge(ctx, {
        horse: 'tall'
        , sides: 12
    })

    assert(a.sides == 12)
    assert(a.radius == undefined)
    assert(a.fromCenter == true)
    assert(a.horse == 'tall')
    assert(a.color == undefined)
    assert(a.width == 1)
    assert(a.angle == 0)
    assert(a.open == true)
    assert(a.close == true)


    a = runUnpackLarge(ctx, 22, 10, false, 'green')

    assert(a.sides == 22)
    assert(a.radius == 10)
    assert(a.fromCenter == false)
    assert(a.color == 'green')
    assert(a.width == 1)
    assert(a.angle == 0)
    assert(a.open == true)
    assert(a.close == true)



    a = runUnpackLarge(ctx, 4, 5, NULLY, undefined, undefined, 20)

    assert(a.sides == 4)
    assert(a.radius == 5)
    assert(a.fromCenter == true)
    assert(a.color == undefined)
    assert(a.width == undefined)
    assert(a.angle == 20)
    assert(a.open == true)
    assert(a.close == true)



    a = runUnpackLarge(ctx, 4, 5, NULLY, NULLY, NULLY, 20)

    assert(a.sides == 4)
    assert(a.radius == 5)
    assert(a.fromCenter == true)
    assert(a.color === undefined)
    assert(a.width == 1)
    assert(a.angle == 20)
    assert(a.open == true)
    assert(a.close == true)


}


const assert = function(expr) {
    if(expr == true) {

        return
    }

    throw "Fail"
}


const runUnpackLarge = function(ctx, sides, radius, fromCenter=true, color,
                                      width=1, angle=0, open=true, close=true) {

    let data = unpack(arguments, {

                sides: 7
                , radius
                , fromCenter: true
                , color: undefined
                , width: 1
                , angle
                , open
                , close
            })
    return data
}




const runUnpackArgsDefault = function(ctx, otherPoint={}, color='red', width=1) {

    let al = arguments.length
    let data = unpack(arguments, {
                otherPoint
                , color
                , width
            })
    return data
}

;
;

const pointArray = function(count=5, distance=10) {
    let res = new PointList
    let f = (i) => point(0, distance*i);
    if(typeof(distance) == 'function') {
        f = distance
    }

    for(let i = 0; i<=count-1; i++){
        let p = f(i)
        res.push(p)
    }

    return res
}


const asPoints = function(items) {
    let res = new PointList;
    for(let item in items) {
        res.push(new Point(items[item]))
    }
    return res
}


function originRotate(target, origin, theta) {



    const thetaRad = theta * (Math.PI / 180);


    const aPrime = [target[0] - origin[0], target[1] - origin[1]];


    const aPrimeRotated = [
        aPrime[0] * Math.cos(thetaRad) - aPrime[1] * Math.sin(thetaRad),
        aPrime[0] * Math.sin(thetaRad) + aPrime[1] * Math.cos(thetaRad)
    ];


    const aDoublePrime = [aPrimeRotated[0] + origin[0], aPrimeRotated[1] + origin[1]];

    return aDoublePrime;
}



class LazyAccessArray extends Array {







    get draw() {
        const C = (this.drawClass || PointListDraw)
        return (this._draw || (this._draw = new C(this)))

    }

    get pen() {

        const C = (this.penClass || PointListPen)
        if(this._pen == undefined) {
            Object.defineProperty(this, '_pen', { value: new C(this) })
        }
        return this._pen

    }

    get gradient() {
        const C = (this.gradientClass || PointListGradient)
        if(this._gradient == undefined) {
            Object.defineProperty(this, '_gradient', { value: new C(this) })
        }
        return this._gradient
    }

    get generate() {
        const C = (this.generatorClass || PointListGenerator)
        if(this._generator == undefined) {
            Object.defineProperty(this, '_generator', { value: new C(this) })
        }
        return this._generator
    }

    get shape() {
        const C = (this.shapeClass || PointListShape)
        if(this._shape == undefined) {
            Object.defineProperty(this, '_shape', { value: new C(this) })
        }
        return this._shape
    }

    siblings(close=false) {

        let r = []
            , l = this.length;

        for (var i = 0; i < l; i++) {
            let to = this[i+1]
            if(to==undefined) {continue}
            let v = new PointList(this[i], to)
            r.push(v)
        }

        if(close) {
            let v = new PointList(this[l-1], this[0])
            r.push(v)
        }

        return r
    }

    pairs(close=false) {

        let r = []
            , l = this.length;

        for (var i = 0; i < l-1; i+=2) {
            let v = new PointList(this[i], this[i+1])
            r.push(v)
        }

        if(close) {
            let v = new PointList(this[l-1], this[0])
            r.push(v)
        }
        return r
    }

    triples() {

        const triples = [];
        const len = this.length;
        for (let i = 0; i < len; i++) {
            triples.push(new PointList(
                        this[i % len]
                        , this[(i + 1) % len]
                        , this[(i + 2) % len]
                    ));
        }
        return triples;
    }

    get each() {

        const target = this;


        const handler = {
            set(headTarget, innerProp, value) {

                let innerV = value
                if(!isFunction(innerV)) {
                    innerV = ()=> value
                }

                target.forEach((p, i, a)=>{
                    p[innerProp] = innerV.apply(p, [p, i, a])
                })

                return true
            }

            , get(target, prop, receiver) {

                const caller = function eachCaller(values) {

                    let r = []
                    let previouslyCalled = undefined;
                    let isCaller = function(v){
                        if(previouslyCalled) {
                            return previouslyCalled
                        }
                        previouslyCalled = isFunction(v)
                    }

                    this.target.forEach((p)=>{

                        let v = p[this.prop]
                        if(isCaller(v)){
                            v = v.apply(p, arguments)
                        }
                        r.push(v)
                    })
                    return r;
                }

                let head = caller.bind({ target, prop })

                const headHandler = {

                    set(headTarget, innerProp, value) {
                        console.log('Set', innerProp, value)
                        target.forEach((p)=>{
                            p[innerProp] = value
                        })
                    }

                    , get(headTarget, innerProp, _proxy) {
                        console.log('Get', innerProp, _proxy)

                        let fs = {
                            array: ()=> {
                                let r = []
                                target.forEach((p)=>{ r.push(p[prop]) })
                                return r
                            }
                        }

                        return fs[innerProp]
                    }
                    , next(){
                        console.log('next')
                    }
                    , [Symbol.iterator] () {
                        console.log('iterator')
                        return stage.points
                    }

                    , apply(target, thisArg, argsList) {



                        return target.apply(thisArg, argsList)
                    }
                }


                const proxy = new Proxy(head, headHandler);

                return proxy
            }
        }

        const proxy = new Proxy(target, handler);
        return proxy;
    }
}


class PointList extends LazyAccessArray {

    first() {
        return this[0]
    }

    last() {
        return this[this.length-1]
    }

    copy(deep=false) {

        let pl = new PointList;
        if (deep == true) {
            this.forEach(p=>{
                pl.push(p.copy())
            })
            return pl
        }

        return  pl.concat(this)
    }

    getBoundingClientRect() {

        return DOMRect.fromRect(this.getSize())
    }

    getSize() {


        let x = 0
            , y = 0
            , min = this[0]?.copy?.() || this[0]
            , max = {x,y}
            ;

        this.forEach((p)=>{

            if(p.x < min.x) { min.x = p.x };
            if(p.y < min.y) { min.y = p.y };

            if(p.x > max.x) { max.x = p.x };
            if(p.y > max.y) { max.y = p.y };
        })

        return {
            x: min.x
            , y: min.y
            , width: max.x - min.x
            , height: max.y - min.y
            , min, max
        }
    }

    cast(type=Point, func) {

        if(func == undefined)  {
            func = function(p){
                return new type(p)
            }
        }
        return this.map(p=>func(p, type))
    }

    centerOfMass(type='simple', origin) {
        return centerOfMass[type](this, origin)
    }

    get center() {
        let size = this.getSize()
        let x = (size.width * .5)
        let y = (size.height * .5)

        return new Point(size.x + x, size.y + y)
    }

    setX(value, key='x') {
        return this.setMany(value, key)
    }

    setY(value, key='y') {
        return this.setMany(value, key)
    }

    setData(data) {
        for(let k in data) {
            this.setMany(data[k], k)
        }
    }

    getById(id){
        for(let p of this) {
            if(p._id == id) {
                return p
            }
        }
    }

    getByName(name) {
        return this.getByKey('name', name)
    }

    getByKey(key, value) {
        for(let x of this){
            if(x[key] == value){
                return x
            }
        }
    }

    update(data) {
        this.forEach((e,i,a)=> {
            return e.update(data)
        })
    }

    setMany(value, key) {

        if(isPoint(value)) {
            value = point[key]
        }

        let f = value;

        if(!isFunction(value)) {
            f = (e,i,a) => {
                    e[key] = value
                }
        }

        this.forEach((e,i,a)=> {
            return f(e,i,a)
        })
    }

    keyMany(key, value) {

        let orig = value

        if(isPoint(value)) {
            value = orig[key]
        }

        let f = value;

        if(!isFunction(value)) {
            f = function(e,i,a){
                    return value
                }
        }

        this.forEach((e,i,a)=> {
            return e[key] = f(e,i,a)
        })
    }

    cleanArray(fix=true) {
        let r = []
        this.forEach((x)=>r.push(x.asArray(fix)))
        return r
    }

    offset(value) {
        this.forEach(p=>{
            let va = p.add(value)
            p.x = va.x
            p.y = va.y


        })
    }

    rotate(value, point) {

        if(point == undefined && isPoint(value)) {
            this.handleRotate(value)
        }

        let rot = isPoint(value)? value.rotation: value

        if(point == undefined) {
            point = this.centerOfMass()
        }

        this.forEach(p=>{
            let target = p
            const res = originRotate(target, point, rot);
            target.x = res[0]
            target.y = res[1]

        })

    }

    lastDiff = 0
    handleRotate(handlePoint) {
        let rot = handlePoint.radians

        this.forEach(target=> {
            let diff = radiansDiff2(handlePoint.radians, this.lastDiff)
            const res = originRotate(target, handlePoint, radiansToDegrees(diff))

            target.x = res[0]
            target.y = res[1]

        })
        this.lastDiff = handlePoint.radians
    }


    everyEvery(func) {

        const points = this;

        let complete = new Set();

        points.forEach((e,i,a)=>{
            points.forEach((f,j)=> {
                if(e.uuid == f.uuid) { return }
                let v = e.iid + f.iid
                if(complete.has(v)) {
                    return
                }
                complete.add(v)

                func(e,f)
            })
        })
    }

    lookAt(other) {
        this.forEach(p=>{ p.lookAt(other)})
    }

    grow(point=undefined) {

    }

    sortByRadius(){
        this.sort((a,b)=>b.radius-a.radius)
    }

    sortByZ(){
        this.sort((a,b)=>b.z-a.z)
    }

    remove(item) {

        let i = this.indexOf(item)
        if(i>-1){
            return this.splice(i, 1)
        }

    }
}


Polypoint.head.install(PointList)


PointList.generate = new PointListGenerator();

;
;

class XY extends Array {

    get x() {
        return this[0]
    }

    get y() {
        return this[1]
    }

    multiply(v) {
        this[0] *= v
        this[1] *= v
        return this
    }

    mul(){ return this.multiply.apply(this, arguments) }
}



class Relative {

    constructor(opts={}){

        this._relativeData = [0, 0, 0, 0]
    }

    getRelativeData() {
        let r = this._relativeData
        if(r == undefined) {

            r = this._relativeData = [0, 0, 0, 0]
        }
        return r
    }

    get rel() {
        let parent = this;
        let r = this._rel
        if(r != undefined) {
            return r
        }

        let relData = this.getRelativeData()
        let sp = {
            get x(){
                return relData[0]
            }

            , set x(v) {
                relData[0] = v
            }

            , get y(){
                return relData[1]
            }

            , set y(v) {
                relData[1] = v
            }

            , get radius() {
                return relData[2]
            }

            , set radius(v) {
                return relData[2] = v
            }

            , get rotation() {
                return relData[3]
            }

            , set rotation(v) {
                return relData[3] = v
            }

            , clear() {

                parent._relativeData = [0,0,0,0]
            }
        }

        this._rel = sp
        return sp
    }

    set rel(v) {
        this._opts.rel = v
    }

    set xy(other) {

        this.x = other[0]
        this.y = other[1]
    }

    get xy() {

        return new XY(this.x, this.y,)
    }

}

;
;
class PointCast {


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


;
;

const isPoint = function(value) {
    return value.constructor == Point
}


const isFunction = function(value) {
    return (typeof(value) == 'function')
}


const point = function(p, b) {
    if(p.constructor == Point) {
        return p
    }
    if(Array.isArray(p)) {
        return new Point({x: p[0], y:p[1]})
    }

    if(b !== undefined) {
        return new Point({x: p, y: b})
    }

    return p
}



function getVector(radians, multiplier=1) {

    return {

        x: multiplier * Math.cos(radians)
        , y: multiplier * Math.sin(radians)
    }
}


window.loadDocInfo = function() {

    console.log('loadDocInfo called')
    return Point;
}


class Positionable extends Relative {



    set x(value) {


        return this.setSpecial('x', value)
    }

    set y(value) {


        return this.setSpecial('y', value)
    }

    get x() {






        return this.getSpecial('x', 0)
    }

    get y() {





        return this.getSpecial('y', 1)
    }

    set radius(v) {

        return this.setSpecial('radius', v)
    }

    get radius() {





        return this.getSpecial('radius', 2, 5)
    }

    setSpecial(key,  value) {

        let rV = isFunction(value)? value(this, key): value
        const v = this.onSpecialSet(key, rV)
        this._opts[key] = v === undefined? rV: v
        return true
    }

    onSpecialSet(key, value) {

        this._dirty = true
        let name = `${key}Set`
        let r = this[name] && this[name](value)
        this._onDirty?.forEach(f=>f(name, r))

        return r
    }

    onDirty(func) {

        if(!this._onDirty) { this._onDirty = [] }
        this._onDirty.push(func)
    }

    get dirty() {

        return this._dirty
    }

    get wasDirty() {

        let r = this._dirty
        this._dirty = false;
        return r
    }


    getSpecial(key, relIndex=undefined, defaultValue=0) {

        const internalValue = this._opts[key];
        let r = internalValue == undefined? defaultValue: internalValue
        r = isFunction(r)? r(this, key): r
        let relVal = relIndex != undefined? this.getRelativeData()[relIndex]: 0
        return r + relVal
    }

    set(x, y, radius, rotation) {

        const isUndefined = function(v) {
            return v === undefined
        }

        const ifUndefined = (v, d) => v === undefined? d: v


        if(isUndefined(y)) {

            if(Array.isArray(x)) {
                this.fromArray
                let lmap = {
                    1: () => {

                    }
                    , 2: ()=> {
                        [x,y] = x
                    }
                    , 3: ()=> {
                        [x,y, radius] = x
                    }
                    , 4: ()=> {
                        [x,y, radius, rotation] = x
                    }
                }

                lmap[x.length]()

            } else if(typeof(x)=='number') {
                y = x
                x = x
            }else{

                for(let k in x) {
                    this[k] = x[k]
                }
                y = x?.y
                x = x?.x
            }
        }


        this.x = ifUndefined(x, 0)
        this.y = ifUndefined(y, 0)

        if(!isUndefined(radius)) {

            this.radius = radius
        }

        if(!isUndefined(rotation)) {

            this.rotation = rotation
        }
    }

    _cast(other, _2=other) {
        if(typeof(other) == 'number') { other = point(other, _2) }
        if(Array.isArray(other)){ return point(other, _2) }
        return other
    }

    subtract(other, _2=other){

        if(typeof(other) == 'number') {
            other = point(other, _2)
        }

        return new Point(this.x - other.x, this.y - other.y)
    }

    add(other, _b,) {

        other = this._cast(other, _b)

        return new Point(
            this.x + other.x,
            this.y + other.y
        )
    }

    divide(other) {

        if(typeof(other) == 'number') {
            other = point(other, other)
        }

        let nNaN = v => isNaN(v)? 0: v;

        return new Point(
              nNaN(this.x / other.x)
            , nNaN(this.y / other.y)
        )
    }

    multiply(other) {

        if(typeof(other) == 'number') {
            other = point(other, other)
        }

        return new Point(
            this.x * other.x,
            this.y * other.y
        )
    }










    midpoint(other, offset=0.5) {

        let p = this.copy();
        p.x = p.x + (other.x - p.x) * offset;
        p.y = p.y + (other.y - p.y) * offset;
        return p;
    }

    lerp = this.midpoint

}



class Rotation extends Positionable {
    set rotation(value){


        if(this.modulusRotate == false) {
            return this.setSpecial('rotation', value)
        }

        return this.setSpecial('rotation', value % 360)

    }

    rotate(degrees) {
        this.rotation = this.UP + degrees
        return this
    }

    get rotation() {
        return this.getSpecial('rotation', 3)
    }

    get radians() {

        return degToRad(this.getSpecial('rotation', 3))
    }

    set radians(angle) {

        this.rotation = radiansToDegrees(angle)
    }

    lookAt(otherPoint, add=0, rotationMultiplier=undefined) {

        return this.radians = this.directionTo(otherPoint, rotationMultiplier, add)
    }

    directionTo(otherPoint, rotationMultiplier=undefined, addRad=0) {

        let delta = 0
        try {
            delta = otherPoint.subtract(this);
        } catch(e) {
            if(!isPoint(otherPoint)) {
                otherPoint = new Point(otherPoint)
                delta = otherPoint.subtract(this);
            } else {
                throw e
            }

        }
        if(rotationMultiplier != undefined) {
            let normRad = this._normalizedRadians(otherPoint, rotationMultiplier, addRad)
            return normRad
        }


        const angleRadians = delta.atan2()
        return angleRadians + addRad
    }

    _normalizedRadians(otherPoint, rotationMultiplier, addRad=0) {
        const delta = otherPoint.subtract(this);
        const targetRad = delta.atan2() + addRad;
        const currentRad = this.radians;

        let radDiff = targetRad - currentRad;

        radDiff = Math.atan2(Math.sin(radDiff), Math.cos(radDiff));
        const newAngleRadians = currentRad + radDiff * rotationMultiplier;
        const normRad = Math.atan2(
                            Math.sin(newAngleRadians),
                            Math.cos(newAngleRadians)
                        );
        return normRad;
    }

    turnTo(otherPoint, rotationMultiplier=1){
        let normRad = this._normalizedRadians(otherPoint, rotationMultiplier)
        this.radians = normRad;
        return normRad
    }

    getTheta(other, direction=undefined) {

        let x = this.x
          , y = this.y
            ;

        if(other) {
            let _p = this.subtract(other)
            x = _p.x
            y = _p.y
        }




        let theta = Math.atan2(y, x) - direction
        return theta
    }
}



class Tooling extends Rotation {

    resolveStringOrFunction(direction, defaultValue) {
        let res = defaultValue;

        if(typeof(direction) == 'string') {

            res = this[direction]
        }

        if(typeof(direction) == 'function') {
            return direction()
        }

        return res
    }

    atan2() {

        let x = this.x
            , y = this.y
            ;

        let thetaRadians = Math.atan2(y, x);
        return thetaRadians
    }

    project(distance, rotation, relative=true) {
        if(rotation !== undefined && relative == true) {
            rotation = (this.UP + rotation) % 360
        }
        let np = new this.constructor(projectFrom(this, distance, rotation))
        np.rotation = this.rotation
        return np
    }

    getTip() {
        const distance = this.radius
        const rads = this.radians
        const vector = this.vector2D(distance)

        const x = this.x + vector.x
        const y = this.y + vector.y




        return { x, y, };
    }

    vector2D(multiplier=1) {

        const rads = this.radians
        return {

            x: multiplier * Math.cos(rads)
            , y: multiplier * Math.sin(rads)
        }
    }

    copy(position, deep=false) {

        if(position) {
            this.set(position.x, position.y)
            if(position?.radians){
                this.radians = position.radians
            }


            if(deep==true && position.radius){
                this.radius = position.radius
            }

            return this;
        }

        return new Point(this.x, this.y, this.radius, this.rotation)
    }

    magnitude() {
        let x = this.x;
        let y = this.y;
        return Math.sqrt(x * x + y * y);
    }

    normalized(magnitude=this.magnitude()) {

        return this.divide(magnitude)

    }

    interpolateTo(other, offset, pointIndex=0) {


        return getPointOffsetAbsolute(this, other, offset, pointIndex)
    }

    interpolateFrom(other, offset, pointIndex=0) {
        return getPointOffsetAbsolute(other, this, offset, pointIndex)
    }

    static distance(a, b){
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    quantize(amount=1) {
        let q = quantizeNumber
        return new this.constructor({
                            x: q(this.x, amount)
                            , y: q(this.y, amount)
                        })
    }

    protractorAngleTo(other, referencePoint) {
        let value = calculateAngleWithRefWithNeg(this, other, referencePoint)
        return new Angle(value)
    }

    lerpPixel(other, pixelDistance) {



        let directionX = other.x - this.x;
        let directionY = other.y - this.y;
        let dirV = this.distance2D(other)
        let distance = this.distanceTo(other)

        let unitX = dirV.x / distance;
        let unitY = dirV.y / distance;


        let offsetX = unitX * pixelDistance;
        let offsetY = unitY * pixelDistance;


        let p = this.copy();
        p.x = this.x + offsetX;
        p.y = this.y + offsetY;

        return p;
    }
}


class Point extends Tooling {





    UP = UP_DEG
    _rotationDegrees = UP_DEG

    constructor(opts={}){

        super(opts)


        opts = arguments[0] || {}


        if(opts && (opts.constructor == this.constructor) ){ return opts }

        if(arguments.length > 1 || typeof(arguments[0] == 'number')){ opts = {} }

        this.modulusRotate = undefined

        this._opts = Object.assign({relX: 0, relY: 0 }, opts)

        this.set.apply(this, arguments)
        this.created()
    }

    created() {

    }

    update(data) {

        for(let k in data) {
            this[k] = data[k]
        }

        return this
    }

    get uuid() {

        let r = this._id;
        if(r == undefined) {
            this._id = r = (~~(Math.random() * 10000)).toString(32)
        }
        return r
    }

    set uuid(v) {
        this._id = v
    }

    get [0]() {

        return this.x
    }

    set [0](value) {

        this.x = value
    }

    get [1]() {

        return this.y
    }

    set [1](value) {

        this.y = value
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return this.toString()
        }
        return null

    }

    toString(){
        let name = 'point'
        return `${name}({x:${this.x}, y:${this.y}})`;
    }

    get _liveProps() { return true }

    asArray(fix=false) {


        let r = Object.values(this.asObject())
        if(fix) {
            let int = (x)=> Number( x.toFixed(Number(fix)) )
            return r.map(v=>int(v))
        }
        return r
    }

    asObject() {

        return {
            x: this.x
            , y: this.y
            , radius: this.radius
            , rotation: this.rotation
        }
    }

}


Polypoint.head.install(Point)


Polypoint.head.mixin('Point', {
    isNaN: {
        value(any=false) {
            let r = 0;
            r += +isNaN(this.x)
            r += +isNaN(this.y)
            if(r==0) { return false }

            if(r > 0) {
                if(any) { return true }

                if(r >= 2) { return true }
            }

            return false
        }
        , writable: true
    }
})


;Object.defineProperty(Point, 'from', {
    value: function(a,b, c, d){

        if(a.offsetX && b==undefined) {

            return new Point(a.offsetX, a.offsetY)
        }
        return new Point(a,b, c, d)
    }
});

;
;
class PointText {

    constructor(point) {
        this.point = point
        this.type = 'fill'
    }

    getText() {
        let p = this.point;
        return this.text
                || this.value
                || p.label
                || p.value
                || p.name
                || p.uuid
                ;
    }

    getOffset(){
        return this.offset || {x:0, y:0, radians: 0}
    }

    string(ctx, text=this.getText(), type=this.type){

       return this[type](ctx, text, this.point, true)
    }

    offsetString(ctx, words=this.getText(), offset=this.getOffset(), type=this.type) {

        return this[type](ctx, words, offset, false)
    }

    label(ctx, words=this.getText(), offset=this.getOffset(), type=this.type) {

        ctx.save();

        let p = this.point;
        let r = p.radians
        r = r==undefined? 0:r

        let ofr = offset.radians
        ofr = ofr == undefined? 0: ofr

        ctx.translate(p.x, p.y)
        ctx.rotate(r + ofr)

        this[type](ctx, words, offset, true)

        ctx.restore();
    }

    fill(ctx, words=this.getText(), offset={x:0,y:0}, abs=false) {
        let p = abs? {x:0, y:0}:this.point
        ctx.fillText(words, p.x + offset.x, p.y + offset.y)

    }

    stroke(ctx, words=this.getText(), offset={x:0,y:0}, abs=false) {
        let p = abs? {x:0, y:0}:this.point
        ctx.strokeText(words, p.x + offset.x, p.y + offset.y)

    }





    plain(ctx, text=this.getText(), offset=this.getOffset()){

        this.writeText(ctx, text, offset)
    }

    writeText(ctx, words=this.getText(), offset=this.getOffset()){




        let pos = this.point

        this.write(ctx, pos, words, offset)
    }

    write(ctx, position, words=this.getText(), offset=this.getOffset()) {
        ctx.save();
        let p = position;
        let r = offset.radians
        ctx.translate(p.x, p.y)
        ctx.rotate(p.radians + (r==undefined? 0:r))
        ctx.fillText(words, offset.x, offset.y)
        ctx.restore();
    }

}

Polypoint.head.deferredProp('Point', function text() {
    return new PointText(this)
})
;
;


class Events {

    constructor(parent=undefined) {
        this.parent = parent
    }

    emit(name, detail) {
        return this.getParent().dispatchEvent(new CustomEvent(name, {detail}))
    }

    on(name, handler, props) {
        return this.getParent().addEventListener(name, handler, props)
    }

    getParent() {
        return this.parent == undefined? window: this.parent;
    }
}


const events = new Events(this)



function getMethodsOf(obj){

    const methods = {}
    Object.getOwnPropertyNames( Object.getPrototypeOf(obj) ).forEach(methodName => {
        methods[methodName] = obj[methodName]
    })
    return methods
}

;addEventListener('stage:prepare', function(event){
    let {id, canvas, stage} = event.detail
    console.log('event', stage)
    if(stage.autoEvents !== false)  {

        stage.events?.wake()
    }
})


class StageEvents {

    autoListen = true

    constructor(stage=undefined) {
        this.stage = stage
        this._hooked = false
    }

    wake(){
        if(this.getAutoListen()) {
            (!this._hooked) && this.hook(this.stage)
        }
    }

    getAutoListen() {
        return this.autoListen !== false && this.stage.autoListen !== false
    }

    hook(entity) {

        const methods = getMethodsOf(entity);
        for(let k in methods){

            if(k.toLowerCase().startsWith('on')) {
                let f = entity[k].bind(entity)
                let eventName = k.slice(2).toLowerCase()

                this.on(eventName,f)
            }
        }
        this._hooked = true
    }

    on(name, handler, props) {
        return this.getEventParent().addEventListener(name, handler, props)
    }

    emit(name, detail) {
        return this.getEventParent().dispatchEvent(new CustomEvent(name, {detail}))
    }

    getEventParent() {
        return this.stage.canvas
    }

    receiverFunction(prop) {
        return (handler, props) => {

            return this.on(prop, handler, props)
        }
    }
}


const stageHandler = function(parent) {

    const unknownAttrProxyHandler = {
        get(target, prop, receiver) {

            if(target[prop] !== undefined) {

                return Reflect.get.apply(target,arguments);
            }

            return target.receiverFunction(prop)
        }
    };

    const target = new StageEvents(parent)
    const eventNameHandlerProxy = new Proxy(target, unknownAttrProxyHandler);
    return eventNameHandlerProxy;
}


Polypoint.head.install(StageEvents)

Polypoint.head.lazierProp('Stage', function events(){
    return stageHandler(this)
})
;
;

const getLastMousePos = function(){
    return autoMouse.getMousePos(canvas)
}


class AutoMouse {


    constructor(parentClass) {

        this.parentClass = parentClass
        this.mouseCache = {x: 0, y: 0}

        this.buttons = {}

        this.positions = {}

        this.zIndex = 'bound'

        this.handlers = {}
        this._announce()

        this._peristentPoint = new Point

    }

    _announce() {


        events.on('stage:prepare', this.stagePrepareHandler.bind(this))



        let data = {
            target: this

        }

        events.emit('addon:announce', data)

    }


    stagePrepareHandler(ev) {
        let d = ev.detail

        return this.announcementResponse(ev, false)
    }

    announcementResponse(ev, log=true){
        let d = ev.detail
        if(log) {
            console.log('AutoMouse::announcementResponse', ev, d)
        }
        let stage = d.stage
        stage.addComponent('mouse', this)
    }

    getMousePos(canvas) {

        var rect = this.getBoundingClientRect();
        let mouseCache = this.mouseCache
        return {
            x: mouseCache.x - rect.left,
            y: mouseCache.y - rect.top
        };
    }

    get xy() {
        return this.mouseCache
    }

    get position() {

        return new Point(this.mouseCache)
    }

    get point() {

        return this._peristentPoint
    }








    getBoundingClientRect(canvas) {

        if(canvas === undefined) {
            canvas = this.canvas;
        }

        return canvas.getBoundingClientRect();
    }

    getListenerMethods() {
        if(this._methods) {
            return this._methods
        }

        const methods = {
            mousemove: this.mousemoveHandler.bind(this)
            , mousedown: this.mousedownHandler.bind(this)
            , mouseup: this.mouseupHandler.bind(this)
            , wheel: [this.wheelHandler.bind(this), {passive: true}]
        }

        if(this.hookTouch) {
            Object.assign(methods, {
                touchstart: this.touchstartHandler.bind(this)
                , touchend: this.touchendHandler.bind(this)
                , touchmove: this.touchmoveHandler.bind(this)
            })
        }
        this._methods = methods
        return this._methods;
    }


    touchstartHandler(canvas, event) {
        console.log('touchstart')
        let space = this.getActionSpace(event.button || 0)
        space.down = true
        this.applyPositionIncrement(space, event.touches[0], event)
        this.callHandlers('mousedown', canvas, event.touches[0], event)
        return this;
    }

    touchendHandler(canvas, event) {

        console.log('touchend')
        this.callHandlers('mouseup', canvas, event)
        let space = this.getActionSpace(event.button || 0)
        space.down = false
        this.applyPositionIncrement(space, event)
        return this;
    }

    touchmoveHandler(canvas, event){
        console.log('onTouchmove')











        this.mousemoveHandler(canvas, event.touches[0], event)
    }


    hookTouch = true

    mount(canvas) {


        if(!this.canvas) {
            this.canvas = canvas
        }
        if(!this.canvas) {
            console.warn('automouse:mount - Cannot mouse Listeners; no canvas.')
            return
        }

        let methods = this.getListenerMethods()
        for(let k in methods) {
            let f = methods[k]
            if(isFunction(f)){
                this.listen(canvas, k, f)
                continue
            }

            this.listen(canvas, k, f[0], f[1])

        }
    }

    listen(canvas, eventName, handler, opts) {
        canvas.addEventListener(eventName, e => handler(canvas, e), opts);
        return this;
    }

    mousemoveHandler(canvas, event) {






        this._lastEvent = event
        var rect = canvas.getBoundingClientRect();
        let positions = {
            local: {
                x: event.offsetX
                , y: event.offsetY
            }

            , page: {
                x: event.pageX
                , y: event.pageY
            }

            , screen: {
                x: event.screenX
                , y: event.screenY
            }
            , client: {
                x: event.clientX
                , y: event.clientY
            }
            , layer: {
                x: event.layerX
                , y: event.layerY
            }
            , vector: {
                x: event.movementX
                , y: event.movementY
            }
            , absolute: {
                x: event.x
                , y: event.y
            }
            , custom: {
                x: event.clientX - rect.left - canvas.clientLeft
                , y: event.clientY - rect.top - canvas.clientTop






            }

            , bound: {
                x: event.clientX - rect.left
                , y: event.clientY - rect.top
            }

        }

        this.positions = positions;
        let state = positions[this.zIndex]
        this.mouseCache = state
        this._peristentPoint.x = state.x
        this._peristentPoint.y = state.y
        this.callHandlers('mousemove', canvas, event)
        return this;
    }

    callHandlers(name, canvas, event) {
        let handlers = this.handlers[name]
        for (let key in handlers) {
            let func = handlers[key]
            func(canvas, event)
        }
    }

    mousedownHandler(canvas, event) {
        let space = this.getActionSpace(event.button)
        space.down = true
        this.applyPositionIncrement(space, event)
        this.callHandlers('mousedown', canvas, event)
        return this;
    }

    mouseupHandler(canvas, event) {
        this.callHandlers('mouseup', canvas, event)
        let space = this.getActionSpace(event.button)
        space.down = false
        this.applyPositionIncrement(space, event)
        return this;
    }

    applyPositionIncrement(space, event) {
        space.count += 1
        space.position = {
                x: event.offsetX || event.clientX
                , y: event.offsetY || event.clientY
            }
            return space
    }

    wheelHandler(canvas, event) {
        let space = this.getActionSpace('wheel', { value: 0 })
        this.applyPositionIncrement(space, event)
        let delta = {
            x: event.deltaX
            , y: event.deltaY
            , mode: event.deltaMode
        }
        let direction = event.wheelDelta > 0
        space.value += direction? 1: -1
        space.delta = delta
        let rel = space.relative
        if(rel == undefined) {
            rel = { x: 0, y: 0 }
        }
        rel.x += delta.x
        rel.y += delta.y

        space.relative = rel
        this.callHandlers('wheel', canvas, event)
        return this;
    }

    isDown(index) {
        let d = this.buttons[index]?.down
        return d == undefined? false: d

    }

    wheelSize(abs=false) {
        let v = (this.buttons.wheel?.value) || 1
        let sq = isFunction(abs) ? abs(v): v
        if(abs==true) { return sq }
        return v < 0? -sq: sq
    }


    clampWheelSize(min, max, abs=false) {
        let ws = this.wheelSize(abs);
        let v =  clamp(ws, min, max)
        if(this.buttons.wheel!=undefined){
            this.buttons.wheel.value = v
        }

        return v
    }


    on(canvas, name, handler, opts) {
        let hs = this.handlers[name] || []
        hs.push(handler)
        this.handlers[name] = hs;
        let methods = this.getListenerMethods()

        if(methods[name] == undefined) {
            console.warn('Installing generic handler', name)
            this.listen(canvas, name, handler, opts)
        }
    }

    getActionSpace(name, defaults={}) {
        let space = this.buttons[name]
        if(space == undefined) {
            space = { count: 0 }
            Object.assign(space, defaults)
            this.buttons[name] = space
        }

        return space
    }

    speed(previous=this._speedPrevious, delta=1) {

        let current = this.xy
        if(previous == undefined) {
            this._speedPrevious = current
            return -1
        }

        this._speedPrevious = current
        return this.computeSpeed(previous, current)
    }

    _moduloTicker = 0
    modulatedSpeed(mod=15, previous=this._speedPrevious, delta=1){
        this._moduloTicker += 1
        let current = this.xy
        if(this._moduloTicker % mod == 0) {
            this._moduloTickerCompute = this.speed(previous, delta)
            return this._moduloTickerCompute
        }
        this._speedPrevious = current
        return this._moduloTickerCompute
    }


    computeSpeed(previous, current, delta=1) {
        const dx = (current.x - previous.x) / delta
        const dy = (current.y - previous.y) / delta
        return dx * dx + dy * dy
    }
}

Polypoint.head.install(AutoMouse)


const autoMouse = (new AutoMouse(Point))


Polypoint.head.static('Point', {
    mouse: {
        value: autoMouse



    }
})



addEventListener('stage:prepare', (e)=>{


    Point.mouse?.mount(e.detail.stage.canvas)

});


try{


    Point.pointArray = pointArray
} catch {
    console.warn('pointArray is not defined')
}

;
;

const clamp = function(v, lower=undefined, upper=undefined) {
    let res = v;
    if(lower !== undefined && v < lower) {
        res = lower;
    }

    if(upper !== undefined && v > upper) {
        res = upper;
    }
    return res
}


Polypoint.head.add(clamp, 'math')
;
;

class Random {


    pointIntMin = 2

    int(min=1, max) {

        if(max != undefined) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        let r = this.float()
        return Number( ~~(r * min) )
    }

    float(min=1, max) {

        if(max != undefined) {
            return Math.random() * (max - min) + min;
        }

        return Math.random() * min
    }

    callOne(functions) {

        return selections[this.index(selections)]()
    }

    choice(selections) {

        return selections[this.index(selections)]
    }

    index(selections) {

        return Math.floor(selections.length * Math.random())
    }

    string(multiplier=1, rot=32){

        return this.radix(this.float(multiplier), rot).slice(2)
    }

    radix(v, rot=32) {
        return v.toString(rot)
    }

    point(multiplier=1, method=undefined) {

        if (method == undefined) {
            method = multiplier <= this.pointIntMin ? 'float': 'int'
        }

        let p = new Point(this[method](multiplier), this[method](multiplier))
        return p
    }

    shuffle(points, max=1) {

        points.forEach(p=>p.xy=this.within(p, max))
    }

    within(point, max=.5) {

        let radius = point.radius * 2
        let width = radius
        let height = radius
        let margin = this.point.radius * 2
        let maxMove = width * max
        let x = point.x
        let y = point.y


        let precision = 0
        let halfPi = Math.PI / 180
        let distance = Math.random() * maxMove
        let angle = Math.random() * 360
        let tx = x + distance * Math.sin(halfPi * angle)
        let ty = y + distance * Math.cos(halfPi * angle)
        x = +tx.toFixed(precision)
        y = +ty.toFixed(precision)
        return [x,y]
    }

    xy(multiplier=1) {

        return {"x":this.float(-multiplier, multiplier), "y": this.float(-multiplier,multiplier)}
    }

    gaussianFloat(mean=0, stdev=1) {




        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

        return z * stdev + mean;
    }

    gaussian(start, end, mean=0, stdev=1) {
        return Math.floor(start + this.gaussianFloat(mean, stdev) * (end - start + 1));
    }

    polar2D() {

        let theta  = 2 * Math.PI * Math.random();
        let R   = Math.sqrt(-2 * Math.log(Math.random()));
        let x   = R * Math.cos(theta);
        let y   = R * Math.sin(theta);

        return [ x, y ];
    }

    color(h=360, s=100, l=100) {

        let ri = random.int.bind(random)
        let ia = Array.isArray
        let deg = ia(h)? ri(h[0], h[1]): ri(h)
        let sat = ia(s)? ri(s[0], s[1]): ri(s)
        let lig = ia(l)? ri(l[0], l[1]): ri(l)
        return `hsl(${deg}deg ${sat}% ${lig}%)`
    }
}


const random = new Random()
Polypoint.head.install('Random')


const randomizePoint = function(px, y) {


}
;
;

class Distances {


    constructor(){
        this.points = new Map
    }

    addPoints() {

        for(let p of Array.from(arguments)){
            try{
                this.points.set(p.uuid, p)
            } catch(e) {
                if(p === undefined) {
                    console.error('Distances.addPoints was given an undefined object.')
                }
            }
        }
    }

    removePoints() {
        let r = []
        for(let p of Array.from(arguments)){
            let u = p.uuid
            r.push(this.points.delete(u?u:p))
        }
        return r
    }

    setPoints() {
        this.points.clear()
        this.addPoints.apply(this, arguments)
    }

    closest(point, maxDistance){

        var p;
        var low = undefined;

        if(maxDistance != undefined) {
            return this.within(maxDistance, point)
        }

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


    intersect(point, padding) {
        return this.closest(point, (v,p)=> v<=padding+p.radius)
    }


    within(maxDistance, point){

        if(isPoint(maxDistance)) {
            maxDistance = maxDistance.radius
        }

        var p;
        var low = undefined;


        let test = (v) => v < maxDistance
        if(isFunction(maxDistance)) {
            test = maxDistance
        }
        var setterFunc = (v, e) => {
            if(test(v, e)) {
                if(low == undefined || (v <= low)){
                    low = v
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


    near(point, distance=point.radius){
        const ps = new Set()



        const setterFunc = (v, e) => {

            if(v > distance) { return }
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
};



Polypoint.head.mixin('Point', {
    isNaN: {
        value(any=false) {
            let r = 0;
            r += +isNaN(this.x)
            r += +isNaN(this.y)
            if(r==0) { return false }

            if(r > 0) {
                if(any) { return true }

                if(r >= 2) { return true }
            }

            return false
        }
        , writable: true
    }

    , distanceTo: {
        value(other) {
            return distance(this, other)
        }
    }

    , distance2D: {
        value(other) {
            return distance2D(this, other)
        }
    }
})











function distance(xy1, xy2) {
  return Math.sqrt(Math.pow((xy2.x - xy1.x), 2) + Math.pow((xy2.y - xy1.y), 2));
}


function distance2D(xy1, xy2) {
    const dx = xy1.x - xy2.x;
    const dy = xy1.y - xy2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { x: dx, y: dy, distance }
}


 approx_distance = function(dx,dy ) {

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

    let min = dy;
    let max = dx;
    if(dx < dy) {
        min = dx;
        max = dy;
   }

   let approx = ( max * 1007 ) + ( min * 441 );
   if ( max < ( min << 4 )) {
      approx -= ( max * 40 );
   }


   return (( approx + 512 ) >> 10 );
}



 approx_distance2 = function(dx,dy ) {
   let min, max;

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

   if ( dx < dy )
   {
      min = dx;
      max = dy;
   } else {
      min = dy;
      max = dx;
   }


   return ((( max << 8 ) + ( max << 3 ) - ( max << 4 ) - ( max << 1 ) +
            ( min << 7 ) - ( min << 5 ) + ( min << 3 ) - ( min << 1 )) >> 8 );
}

;
;const PI_180 = (180 / Math.PI)

function calculateAngle360(point1, point2, rotation, direction=1) {

    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;


    let angleInDegrees = Math.atan2(deltaY, deltaX) * PI_180;
    if(rotation == undefined) {
        rotation = point1.rotation
    }

    angleInDegrees = (angleInDegrees + 720 - rotation) % 360;
    if(direction < 0) {
        angleInDegrees = invertClockRotation(angleInDegrees)
    }
    return angleInDegrees;
}


function calculateAngle180(point1, point2, rotation, direction=1) {
    let angleInDegrees = calculateAngle360(point1, point2, rotation, direction)
    return convertAngle180Split(angleInDegrees)
}


function calculateInverseAngle180(point1, point2, rotation, direction=1) {
    let rot = calculateAngle180(point1, point2, rotation, direction) * -1
    rot -= rot > 0? 180: -180
    return rot
}

function invertClockRotation(angleInDegrees) {
    let rev = (360 - angleInDegrees) % 360
    return rev;
}


function convertAngle180Split(angle) {
    let newAngle = angle % 360;
    if (newAngle > 180) {
        newAngle -= 360;
    }
    return newAngle;
}

function getCavity(point1, midPoint, point2) {



  debugger;
}

function calculateAngleDiff(primaryPoint, secondaryPoint) {


    let rads = radiansDiff(primaryPoint.radians, secondaryPoint.radians)
    return radiansToDegrees(rads)
}

function radiansDiff(primaryRads, secondaryRads) {
   return ((primaryRads - secondaryRads) + Math.PI2) % Math.PI2
}

function calculateAngleWithRef(point1, point2, referencePoint) {


  const refDeltaX = point1.x - referencePoint.x;
  const refDeltaY = point1.y - referencePoint.y;
  let refAngleInDegrees = Math.atan2(refDeltaY, refDeltaX) * (180 / Math.PI);
  refAngleInDegrees = (refAngleInDegrees + 360) % 360;


  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angleInDegrees = (angleInDegrees + 360) % 360;


  let relativeAngleInDegrees = angleInDegrees - refAngleInDegrees;


  relativeAngleInDegrees = (relativeAngleInDegrees + 720) % 360;

  return relativeAngleInDegrees;
}

;
;


Polypoint.head.mixin('Point', {

    _draggable: {
        value: true,
        writable: true
    }

    , draggable: {
        get() {
            return this._draggable
        }

        , set(v) {
            this._draggable = false
        }


    }
})





class Dragging extends Distances {


    clickSpeed = 300
    clickDragDeadzone = undefined
    maxWheelValue = 500
    padding = 10


    twistMouse = true

    constructor(stage) {
        super()
        this.stage = stage;
        this.isDragging = false
        this.toy = new Point()
        this.toy2 = new Point({ radius: 10})
    }

    wake() {
        if(this._near == undefined) {
            this.initDragging()
        }
    }

    initDragging(stage=this.stage){
        let c = stage.canvas
            , mouse = stage.mouse
            ;

        if(mouse == undefined) {
            console.error('automouse is not imported. Cannot listen to mouse actions.')
            return
        }
        mouse.listen(c, 'touchstart', (c,ev)=> this.onTouchstart(stage,c,ev))
        mouse.listen(c, 'touchmove', (c,ev)=> this.onTouchmove(stage,c,ev))
        mouse.listen(c, 'touchend', (c,ev)=> this.onTouchend(stage,c,ev))
        mouse.listen(c, 'mousedown', (c,ev)=> this.onMousedown(stage,c,ev))
        mouse.listen(c, 'mousemove', (c,ev)=> this.onMousemove(stage,c,ev))
        mouse.listen(c, 'mouseup', (c,ev)=> this.onMouseup(stage,c,ev))
        mouse.listen(c, 'wheel', (c,ev)=> this.onWheelInternalActive(stage,c,ev), {passive: false})
        mouse.listen(c, 'wheel', (c,ev)=> this.onWheelInternalPassive(stage,c,ev), {passive: true})
        mouse.listen(c, 'contextmenu', (c,ev)=> this.onContextMenu(stage,c,ev))

        this._near = new Point(mouse.position);
    }

    add(point) {
        return this.addPoints.apply(this, arguments)
    }

    set(many) {
        return this.setPoints.apply(this, arguments)
    }

    onMousedown(stage, canvas, ev) {


        return this.primaryActionDown.apply(this, arguments)
    }

    onTouchmove(stage, canvas, ev) {

        this.onMousemove(stage, canvas, {
                    x: ev.touches[0].clientX
                    , y: ev.touches[0].clientY
                })
    }

    onTouchstart(stage, canvas, ev) {
        return this.primaryActionDown.apply(this, [stage, canvas, {
                    x: ev.touches[0].clientX
                    , y: ev.touches[0].clientY
                }])
    }

    onTouchend(stage, canvas, ev) {


        this.onMouseup(stage, canvas, ev)

    }

    primaryActionDown(stage, canvas, ev){

        this._mousedownDelta = +(new Date)
        this.mousedownOrigin = {x:ev.x, y:ev.y, radius: 20}


        if(this._near == undefined) {

            return this.emptyMouseDown(stage, canvas, ev)
        }

        this.mousedownRotationTool(ev)

        let distanceValue = this.distanceValue = this._near.distance2D(this.mousedownOrigin)
        this.downPointDistance = new Point(distanceValue)
        this._mousedown = true
        this._grabbingId = this.stage?.cursor.set('grabbing', this._cursorId)

        this.callPointHandler('onMousedown', ev, this._near)



        if(this._near.draggable){
            this.onDragStartHandler(ev, this._near)
        }


    }

    emptyMouseDown(stage, canvas, ev) {

        this.callDoubleHandler('onEmptyDown', ev)
        stage.onEmptyDown && stage.onEmptyDown(ev)
    }

    getPoint(){

        return this._near
    }

    onMousemove(stage, canvas, ev) {
        if(!this._mousedown) {



            const found = this.intersect(stage.mouse.position, this.padding)
            this._near = found
            this.cursorChange(found)
            this.callPointHandler('onMousemove', ev, found)



            return
        }

        let isRightClick = this.isRightClickOkay(ev)


        if(ev.shiftKey || isRightClick){
            this.onShiftMouseMoveHandler(ev)
            this.didSpin = true
        } else {
            this.onDragMoveHandler(ev)
        }
    }

    isRightClickOkay(ev){
        return (this.twistMouse && (ev.which == 3))
    }

    mousedownRotationTool(ev){
        this.mousedownPoint = Point.from(ev)
        this.mousedownPoint.rotation = this._near.rotation
        this.mousedownPoint.radius = 20

        this.mousedownOrigin.rotation = this._near.rotation
    }

    onShiftMouseMoveHandler(ev){


        let spinX = this._near.x
        let spinY = this._near.y
        let targetCenter = new Point(spinX, spinY);
        let mousePos = this.stage.mouse.position;
        let downPoint = this.mousedownPoint


        let rot = calculateAngle360(targetCenter, mousePos, downPoint.rotation)
        this.toy.update({
                x: spinX
                , y: spinY
                , radius: 20




                , rotation: rot + this.mousedownOrigin.rotation
            })
        this.toy2.update({
                x:spinX
                , y:spinY
                , radius: 20
            }).lookAt(downPoint)

        let nrot = calculateAngleDiff(this.toy, this.toy2)
        this.toy.text && (this.toy.text.value = nrot.toFixed(0))
        this._near.rotation = downPoint.rotation + nrot

    }

    cursorChange(found) {
        if(found) {


            if(this._stackedCursor === true) {

            } else {
                this._emitCursorHover()
            }

            return
        }

        if(this._stackedCursor === true) {
            this._emitCursorRelease()
        }

    }

    _emitCursorHover() {
        this._stackedCursor = true

        this._cursorId = this.stage?.cursor.set('grab')
    }

    _emitCursorRelease() {
        this._stackedCursor = false
        let id = this._cursorId

        this.stage?.cursor.unset(id)
    }

    onMouseup(stage, canvas, ev) {
        this._mousedown = false;
        let nowDelta = +(new Date)
        let delta = nowDelta - this._mousedownDelta
        let isClick = delta <= this.clickSpeed
        let minDistance = this.clickDragDeadzone
        if(minDistance == undefined) {
            minDistance = 20
        }

        let dis = this.dragDistance(ev)
        let withinClickDelta = dis < minDistance


        if(this._grabbingId != undefined) {
            this.stage.cursor.unset(this._grabbingId)
            this._grabbingId = undefined
        }

        this.callPointHandler('onMouseup', ev)

        if(isClick && (withinClickDelta)) {


            return this.onClickHander(stage, canvas, ev)
        }

        if((!withinClickDelta) || this.isDragging ) {

            return this.onDragEndHandler(ev)
        }


        this.onLongClick(stage, canvas, ev, delta)
    }

    onWheelInternalPassive(stage, canvas, ev) {
        let n = this._near;
        if(!n) { return this.onWheelEmpty(ev)};

        let size = ev.wheelDelta
        let positive = size > 0
        let compute = Math.abs(size * .01)
        let radius = n.radius;
        let rad = positive? radius*compute: radius/compute;
        n.radius = clamp(rad, 1, this.maxWheelValue)
        n.onResize && n.onResize(ev, stage, canvas)

        this.callDoubleHandler('onWheel', ev, n)
    }

    onWheelInternalActive(stage, canvas, ev) {
        ev.preventDefault()
    }

    onLongClick(stage, canvas, ev, delta) {
        console.log('Long Click (not dragged)', delta)
        this.callPointHandler('onLongClick', ev, this._near, delta)
        stage.onLongClick && stage.onLongClick(ev, delta)

    }

    getDownTimeTaken() {
        return +(new Date) - this._mousedownDelta
    }

    onContextMenu(stage,c,ev) {

        let timeDown = this.getDownTimeTaken()

        if(this.twistMouse) {

            let distance = this.mousedownPoint?.distanceTo(ev)
            if((distance && (distance > 10)) && timeDown > 100) {
                ev.preventDefault()
                return
            }

            if(timeDown < 300) {
                return
            }


            ev.preventDefault()
        }
    }


    dragDistance(ev) {
        if(!this.mousedownOrigin) {
            console.log('! no mouse origin')
            return 0
        }
        let v = distance(this.mousedownOrigin, ev)
        return v
    }

    onClickHander(stage, canvas, ev) {


        if(this.isEdgeDragging == true) {
            this.onEdgeEnd(ev)
        }
        let p = this._near
        this.callDoubleHandler('onClick', ev, p)
    }

    callDoubleHandler(name, ev, p, x) {

        let args = [ev, p]
        if(x != undefined) {
            args = Array.from(arguments).slice(1)
        }

        this[name].apply(this, args)
        this.callPointHandler.apply(this, arguments)
    }

    callPointHandler(name, ev, p=this._near, x) {

        let args = [ev]
        if(x != undefined) {
            args = args.concat(Array.from(arguments).slice(3))
        }
        p && p[name] && p[name].apply(p, args)
    }

    drawAll(ctx) {
        this.drawIris(ctx)
        this.drawTwists(ctx)
    }

    drawTwists(ctx) {
        this.toy2.pen.indicator(ctx, {color: 'black'})
        this.toy.pen.indicator(ctx, {color: 'red'})
        this.toy.text.label(ctx)
        this.mousedownPoint?.pen.indicator(ctx, {color: 'blue'})
    }

    drawIris(ctx) {

        let p = this.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    onWheelEmpty(ev) {}
    onEmptyDown(ev) {}
    onClick(ev) {}
    onDragStart(ev, point){}
    onDragMove(ev) {}
    onDragEnd(ev, point){}
    onWheel(ev, point){}

    onEdgeStart(ev) {
        console.log('onEdgeStart', this._near)
    }

    onEdgeMove(ev) {

    }

    onEdgeEnd(ev) {
        console.log('onEdgeEnd')
    }

    onDragMoveHandler(ev) {
        if(this.isDragging) {
            this.applyXY(ev.x, ev.y)
            this.onDragMove(ev)
            this.callDoubleHandler('onDragMove', ev)
        }

        if(this.isEdgeDragging == true) {
            this.onEdgeMove(ev)
        }
    }

    onDragStartHandler(ev, p){
        this.isDragging = true

        this.callDoubleHandler('onDragStart', ev, p)
    }

    onEdgeStartHandler(ev) {
        this.isEdgeDragging = true
        this.onEdgeStart(ev)
    }


    withinBufferZone(distancePoint, buffer=this.padding) {

        let v = this.distanceValue.distance
        return v > this._near.radius
    }

    onDragEndHandler(ev){
        if(this.isDragging) {
            this.isDragging = false

            this.callDoubleHandler('onDragEnd', ev, this._near)
        }

        if(this.isEdgeDragging == true) {
            this.isEdgeDragging = false
            this.onEdgeEnd(ev)
        }
    }

    applyXY(x,y){
        let offsetSelected = this.downPointDistance.add(x, y)
        this._near.set(offsetSelected.x, offsetSelected.y)
    }
}


class CursorStack {


    constructor(stage) {

        this.icon = 'default'
        this.map = new Map;
        this.stage = stage
    }

    set(name, parallelUnset) {

        let uuid = Math.random().toString(32)





        this.icon = name

        this.setMouseIcon(this.icon)
        return uuid
    }

    setMouseIcon(icon){
        this.stage.canvas.style.cursor = icon
    }

    unset(uuid, perform=true) {



        this.icon = 'default'



            this.setMouseIcon(this.icon)

    }

}


Polypoint.head.lazierProp('Stage', function cursor(){
    return new CursorStack(this);








});



Polypoint.head.lazierProp('Stage', function dragging(){
    console.log('Returning new lazyProp "Dragging"')
    let dr = new Dragging(this)
    dr.initDragging();

    return dr
});


;Polypoint.head.install(Dragging);

;
;

class StageHooks {

    constructor(stage) {
        this.stage = stage
        this.methodMap = new Map

        return new Proxy(this, {
            get(target, prop) {

                if (prop in target) {
                    return target[prop]
                }


                return target.resolveStack(prop)
            }
        })
    }

    resolveStack(prop) {
        if(this.methodMap.has(prop)) {
            return this.methodMap.get(prop)
        }

        let hs = new HookStack
        this.methodMap.set(prop, hs)
        return hs;
    }
}


class HookStack {

    constructor() {
        this.before = new HookList
        this.after = new HookList
    }
}

class HookList {
    constructor() {
        this.items = []
    }
    add() {
        return this.items.push.apply(this.items, arguments)
    }
    remove(fn) {
        const idx = this.items.indexOf(fn)
        if (idx > -1) {
            this.items.splice(idx, 1)
        }
    }
    run() {
        this.items.forEach(f=>f(...arguments))
    }
}




Polypoint.head.install(StageHooks)

Polypoint.head.mixin('Stage', {
    drawHooks: {
        value: new HookStack
    }

});



Polypoint.head.deferredProp('Stage', function hooks() {
    return new StageHooks(this)
})

;
;
const resolveCanvas = function(target, stage) {


    if(target === undefined && stage.canvas !== undefined) {
        target = stage.canvas
    }

    if(target instanceof HTMLElement) {
        return target;
    }

    let node = target
    if(typeof(target) == "string") {

        node = document.getElementById(target)

        if(node == null) {
            let nodes = document.querySelectorAll(target)
            if(nodes.length == 0) {

                console.warn('Cannot resolve node', target)
                return undefined
            }

            if(nodes.length > 1) {
                console.warn('One canvas per stage.', target)
                return nodes[0]
            }
            return nodes[0]
        }

    }

    return node;
}

;
;

class StageBase {


    addonAnnounceHandler(ev) {
        let data = ev.detail
        let instance = data.target

        let response = {
            target: this.target
            , id: this.id
            , canvas: this.canvas
        }

        let detail = this._dispatchPrepare(response)

        this.log('Stage::addonAnnounceHandler', ev, detail)
        instance.announcementResponse(detail)
    }

    dispatch(name, data) {

        this.log('Dispatch', name)
        let detail = this._dispatchPrepare(data)
        let event = new CustomEvent(name, detail);
        dispatchEvent(event)

    }


    _dispatchPrepare(data) {
        data['stage'] = this
        return {detail: data}
    }


    addComponent(name, instance) {
        this.log('Installing', name, 'to', this)
        try{

            Object.defineProperty(this, name, {value: instance})
        } catch(e) {
            console.warn('property failure', name, e)
        }
    }

    log() {
        console.log.apply(console, arguments)

    }

}


class StageRender extends StageBase {

    $drawFunc
    _loopDraw = true
    initData = undefined

    constructor(canvas, drawFunc) {

        super()

        drawFunc = drawFunc || ( ()=>this.stageStartDraw(this.draw) )
        if(drawFunc) {
            this.$drawFunc = drawFunc
        }



        this._nextTick = new Set;


        if(canvas)  {
            this.prepare(canvas)
        }
    }

    stickCanvasSize(canvas, size){
        let rect = size

        if(size == undefined) {
            rect = (canvas.getBoundingClientRect
                    && canvas.getBoundingClientRect()
                    ) || { width: canvas.width, height: canvas.height }

        }

        if(rect.width) { canvas.width  = rect.width; }
        if(rect.height) { canvas.height = rect.height; }
        rect.width  = canvas.width;
        rect.height = canvas.height;
        const newPoint = function(){

            try{ return new Point(); } catch {}
            return {}
        }

        let center = rect.center = this.dimensions?.center || newPoint()

        center.x = canvas.width * .5
        center.y = canvas.height * .5

        return rect;
    }

    get center() {
        return this.dimensions.center
    }

    prepare(target) {

        let id = this.id = Math.random().toString(32)
        this.target = target


        let canvas = (this.resolveCanvas || resolveCanvas)(target, this)

        if(canvas == undefined) {
            let name = target || this.canvas
            let msg = `Stage canvas ("${name}") is undefined through Stage.canvas`
            msg += "\nEnsure the Stage.canvas ID exists on the canvas node."
            console.warn(msg)
        }

        this.canvas = canvas

        this.dispatch('stage:prepare', {target, id, canvas })


        this.dimensions = this.stickCanvasSize(this.canvas)

        this.loopDraw = this.loopDraw.bind(this)
        this._prepared = true;

        this.mounted(canvas)

        addEventListener('addon:announce', (e)=>this.addonAnnounceHandler(e));
    }

    getObserverRoot(){
        return document.querySelector("#scrollArea")
    }

    prepareObserver(opts={}){

        opts.root = this.getObserverRoot()
        const options = Object.assign({
              root,
              rootMargin: "0px",
              scrollMargin: "0px",
              threshold: 1.0,
            }, opts);

        const observer = new IntersectionObserver(callback, options);
    }


    mounted(canvas) {

    }

    stop(freeze=true) {
        return this.freeze(freeze)
    }

    static go(additionalData={}) {


        let _stage = new this;
        return _stage.go.apply(_stage, arguments)
    }

    freeze(freeze=true) {
        this._loopDraw = !freeze
        if(!this._loopDraw) {
            this.stopDraw && this.stopDraw()
        }
    }

    unfreeze(timeout=0, force=false) {


        if(this._loopDraw == true && force == false) {
            return
        }

        this.freeze(false)
        setTimeout(()=>this.loopDraw(), timeout)
    }


    go(additionalData={}) {

        const cleanGoConfig = function(info) {

            if(typeof info == 'string'){
                info = {
                    canvas: info
                }
            }

            if(info instanceof HTMLCanvasElement){
                info = {
                    canvas: info
                }
            }


            if(info.loop === undefined){
                info.loop = true
            }

            return Object.assign(this.initData || {}, info)
        }.bind(this)

        let goData = cleanGoConfig(additionalData)

        if(this._prepared != true) { this.prepare(goData.canvas) }
        this.initData = goData;

        let loop = goData.loop !== undefined? goData.loop: true


        this.update()
        if(loop) {

            this.unfreeze(1,1)
        }

        return this
    }

    static announce(additionalData) {

        const currentLoc = document.currentScript.src
        dispatchEvent(new CustomEvent('stage::announce', {
            detail: { StageClass: this, currentLoc, additionalData },
            bubbles: true
        }));

    }

    stageStartDraw(drawFunc){

        this.firstDraw(this.ctx)
        let $drawFunc = drawFunc  || this.draw
        if(drawFunc) {

            this.$drawFunc = $drawFunc
            this.update()
            return
        }

        this.stopDraw()
    }

    loopDraw() {

        this.update()
        this._loopDraw && requestAnimationFrame(this.loopDraw);
    }

    get ctx() {

        return this._ctx || (this._ctx = this.getContext(this.canvas))
    }

    getContext(canvas, type='2d') {



        let options = this.contextOptions || {
            alpha: true
            , colorSpace: 'srgb'
            , desynchronized: true
            , willReadFrequently: false
        }

        return this.canvas.getContext(type, options)
    }

    update() {

        const ctx = this.ctx;





        this.drawHooks.before.run(ctx)

        let nt = this._nextTick;
        nt.forEach(f=>f(ctx, this))
        nt.size && (this._nextTick = new Set)

        this.$drawFunc(ctx);

        this.drawHooks.after.run(ctx)




    }

    nextTick(func) {

        this._nextTick.add(func)
    }

    onTick(tick, func) {


        if(this._tick == undefined) {
            this._tick = 0
        }

        this.onDrawBefore(()=> {
            this._tick++;

            if(this._tick % tick  == 0) {
                func()
            }
        })
    }

    onDrawBefore(func) {

        this.drawHooks.before.add(func)
    }

    onDrawAfter(func) {

        this.drawHooks.after.add(func)
    }

    offDrawAfter(func) {


        this.drawHooks.after.remove(func)
    }

    offDrawBefore(func) {


        this.drawHooks.before.remove(func)
    }


    firstDraw(ctx) {

    }


    draw(ctx) {

        this.clear(ctx)
    }

    clear(ctx=this.ctx, fillStyle=null) {

        let dimensions = this.dimensions
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        if(fillStyle === null) { return }
        ctx.rect(0, 0, dimensions.width, dimensions.height);
        ctx.fillStyle = fillStyle
        ctx.fill();
    }
}


class Stage extends StageRender {

    loaded = false

    prepare(target) {
        super.prepare(target)

        if(!this.loaded) {
            this.load()
            this.loaded = true
        }

        this.log('Stage Prepared')
    }

    load() {


        this.dispatch('stage:load', {stage:this})
    }
}


Polypoint.head.install(Stage)


;
;
class SetUnset {


    constructor(settings={}) {
        this.settings = settings;
        this._cache = {}
        this.steps = []
        this._enabled = settings.enabled === undefined? true: settings.enabled

        this.onCreate(this.update(settings))
    }

    onCreate(cachedData) {

    }

    update(settings) {

        let [o, steps] = this.prepare(settings)
        this.steps = this.steps.concat(steps)
        return Object.assign(this._cache, o)
    }

    getOpts() {

        let props = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype)
        let rawProps = new Set()
        for(let k of props) {
            let v = props[k]
            if(typeof(v) == 'function') {
                continue
            }
            let desc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, k)
            if(desc.set != undefined) {
                rawProps.add(k)
            }
        }

        let sugarProps = {}
        let functionalProps = {}
        return [
            rawProps, {}, {}
        ]
    }

    prepare(settings){


        let [

            rawProps

            , sugarProps

            , functionalProps
        ] = Object.values(this.getOpts())

        let isRaw = (k) => rawProps.has(k)


        let generalAcceptor = this.genericKeyApply.bind(this)
        let functionalAcceptor = this.functionKeyApply.bind(this)
        let adds = {};
        let steps = [];

        for(let key in settings) {
            let value = settings[key]
            if(isRaw(key)) {

                adds[key] = {f:generalAcceptor, k: key, v: value}
                continue
            }

            if(key in sugarProps) {

                adds[sugarProps[key]] = {f:generalAcceptor, k: key, v: value}
                continue
            }


            if(key in functionalProps) {



                let res = functionalProps[key]

                if(typeof(res) == 'string') {
                    adds[res] = {f:functionalAcceptor, k: key, v: value}
                    continue
                }

                this[res[0]]();
                let ref = {f:functionalAcceptor, k: key, v: value}
                adds[res[1]] = ref

                if(res[2]) {


                    ref['step'] = res[2]
                    steps.push(res[1])
                }
            }
        }

        return [adds, steps]
    }

    genericKeyApply(ctx, key, newValue) {

        let existing = ctx[key]
        ctx[key] = newValue
        return { v: existing, f: this.genericKeyRemove.bind(this)}
    }

    genericKeyRemove(ctx, key, newValue){

        return this.genericKeyApply(ctx, key,newValue)
    }

    functionKeyApply(ctx, assignment, newValue, key) {

        try {

            return this[assignment](ctx, key, newValue)
        } catch(e) {
            if(e.name == 'TypeError') {
                let m = `function method does not exist: ${assignment}`

            }

            throw e
        }
    }

    set(ctx, settings=this.settings){

        if(!this._enabled) {
            return
        }

        let cacheProps = this.getCacheBeforeApply();

        let keep = {}
        for(let key in cacheProps) {

            let entry = cacheProps[key]
            let stored = entry.f(ctx, key, entry.v, entry.k, cacheProps)
            keep[key] = stored
        }

        this._applied = keep
    }

    getCacheBeforeApply() {
        return this._cache
    }

    unset(ctx, settings) {


        if((!this._enabled) && settings == undefined) {
            return
        }


        let cacheProps = this._applied;

        let keep = {}
        for(let key in cacheProps) {

            let entry = cacheProps[key]
            let stored = entry.f(ctx, key, entry.v, entry.k, cacheProps)

        }

    }

    draw() {

    }

    wrap(ctx, settings, func) {

        if(func == undefined) {
            func = settings;
            settings = this.settings;
        }

        this.set(ctx, settings)
        func(ctx)
        this.unset(ctx, settings)
    }

    step() {


        let ref = this._cache
        if(!ref){ return }


        for(let name of this.steps) {
            const item = ref[name]
            let funcName = item?.step
            try {
                let f = this[funcName](item)
            } catch(e) {
                if(e.name == 'TypeError') {
                    e.message = `step function "${funcName}" does not exist.`
                }
                throw e
            }


        }
    }

    off(setDisable=true) {

        this._enabled = !setDisable
    }

    on(setEnable=true) {
        this._enabled = setEnable
    }

}

;
;













const UNSET = {}


const quickStroke = function(color='green', lineWidth=UNSET, f) {

    ctx.strokeStyle = color.call? color(): color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}


const quickStrokeWithCtx = function(ctx, color='green', lineWidth=UNSET, f) {
    ctx.strokeStyle = color.call? color(): color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}


class Stroke extends SetUnset {

    getOpts() {

        let supported = new Set([
            "strokeStyle"
            , "lineWidth"
            , "lineCap"
            , "lineJoin"
            , "lineDashOffset"
        ])


        let map = {
            color: 'strokeStyle'
            , style: 'strokeStyle'
            , offset: 'lineDashOffset'
            , width: 'lineWidth'
            , cap: 'lineCap'
            , join: 'lineJoin'
        }


        let functional = {
            dash: 'lineDashKeyApply'
            , lineDash: 'lineDashKeyApply'
            , march: ['marchKeyPrepare', 'marchKeyApply','marchKeyStep']



        }

        return { supported, map, functional }
    }

    march(delta=1) {

        let v = this.settings?.march
        if(v == undefined) {
            v = 1
        }
        return this._march += delta * v
    }

    step(delta=1) {
        return this.march(delta)
    }

    marchKeyPrepare() {
        if(this._march == undefined) {
            this._march = 0
        }

    }

    marchKeyStep(ref){
        this._march += ref.v
    }

    marchKeyApply(ctx, key, newValue) {


        let v = this._cache?.lineDashKeyApply.v
        if(v) {
            this._march %= v.reduce((a,b)=>a+b)
        }

        return this.genericKeyApply(ctx, 'lineDashOffset', this._march)
    }

    lineDashKeyApply(ctx, key, newValue, k) {
        let existing = ctx.getLineDash()
        try {

            ctx.setLineDash(newValue)
        }catch(e) {
            if(typeof(newValue) == 'number') {
                console.warn('dash property should be of type Array: [1]')
            }
            throw e
        }
        return {v: existing, f: this.lineDashKeyRemove, k:k }
    }

    lineDashKeyRemove(ctx, key, cachedValue) {

        ctx.setLineDash(cachedValue)
        return cachedValue
    }

}


class StageStrokeMap {



    constructor(stage) {
        this.stage = stage;
        this.cache = new Map
    }

    get(name) {
        return this.cache.get(name)
    }

    has(name) {
        return this.cache.has(name)
    }

    create(name, options) {
        let stroke = new Stroke(options)
        this.cache.set(name, stroke)
        return stroke
    }

    set(name, ctx=this.stage.ctx) {
        let stroke = this.get(name)
        stroke.set(ctx)
        return stroke
    }

    unset(name, ctx=this.stage.ctx) {
        let stroke = this.get(name)
        stroke.unset(ctx)
        return stroke
    }

    remove(name) {
        let stroke = this.get(name)
        this.cache.delete(name)
        return stroke
    }

    delete(name) {
        return this.remove(name)
    }

    propHook(prop) {

        return (func)=> {
            let unit = this.set(prop)
            if(func) { func(unit) }

            let unsetHook = (unit)=>{
                return this.unset(prop)
            }

            if(func) {
                return unsetHook(unit)
            }

            return unit
        }
    }
}


Polypoint.head.deferredProp('Stage', function strokes() {

        let item = new StageStrokeMap(this)


        let handler = {
            get(target, prop, receiver) {
                if(item.has(prop)) {

                    return item.propHook(prop)
                }

                return Reflect.get(...arguments)
            }
            , count: ()=> item.map.size()
        }
        let proxy = new Proxy(item, handler)
        return proxy
})

Polypoint.head.install(Stroke)


const example = function() {

    s = new Stroke({
        name: 'customName'


        , strokeStyle: '#color'
        , lineWidth: 1
        , lineCap: 'miter'
        , lineJoin: 'miter'
        , lineDashOffset: 0


        , lineDash: [3, 3]


        , march: .03

        , dash: 'lineDash'
        , color: 'red'
        , style: '#color'
        , offset: 0
        , width: 3
        , cap: 'miter'
        , join: 'miter'
    })

    s = new Stroke(style, width, dash, offset, cap, join)

    s = new Stroke({
        dash: [3,3]
        , color: 'grey'
        , width: 2
    })

    s.set(ctx)
    s.unset(ctx)

}

;
;
const cosSin = function(value=1) {

    return {
        cos:(multiplier=1) => Math.cos(value) * multiplier
        , sin:(multiplier=1) => Math.sin(value) * multiplier
        , spin(item) {

            if(item.x !== undefined) {
                return {
                    x:this.spinOne(item.x)
                    , y:this.spinOne(item.y)
                }
            }
            return this.spinOne(item)
        }
        , spinOne(multiplier) {
            let c = this.cos(multiplier)
            let s = this.sin(multiplier)
            return {
                    cos:c, x:c,
                    sin:s, y:s,
                }
        }
    }
}


class Addon {

}


const impartOnRads = function(radians, direction) {



    const cs = cosSin(radians)

    const normalizedDir = direction.normalized()



    let spun = cs.spin(normalizedDir)
    const rotatedDir = {
        x: spun.x.cos - spun.y.sin,
        y: spun.x.sin + spun.y.cos
    };

    return rotatedDir
}


class RelativeMotion {
    constructor(parent) {
        this.parent = parent;
    }

    _relativeMove(direction, speed=undefined, minSpeed=0, maxSpeed=1) {
        let p = this.parent

        const magnitude = direction.magnitude()


        if (magnitude === 0) return;

        const rotatedDir = impartOnRads(p.radians, direction)

        if(speed == undefined) { speed = 1 }

        const v = clamp(speed, minSpeed, maxSpeed)
        p.x += rotatedDir.x * v;
        p.y += rotatedDir.y * v;
    }

    move(direction, speed, minSpeed, maxSpeed) {
        return this._relativeMove(direction, speed, minSpeed, maxSpeed)
    }

    left(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:0, y:-1}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    right(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:0, y:1}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    forward(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:1, y:0}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    backward(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:-1, y:0}), speed, minSpeed, maxSpeed)
    }

    towards(other, turnSpeed=.1, speed, minSpeed, maxSpeed) {
        this.parent.turnTo(other, turnSpeed)
        return this.move(new Point({x:1, y:0}), speed, minSpeed, maxSpeed)
    }
}


Polypoint.head.deferredProp('Point',
    function relative() {
        return new RelativeMotion(this)
    }
);


;
;


class VelocityReactor {
    constructor(){
        this.tick  = 0
    }

    step() {

        this.tick += 1

        this.points.forEach((p)=>{
            p.x += p.vx
            p.y += p.vy
        })
    }

    setAll(direction) {

        this.points.forEach(p=>{
            p.velocity.set(direction.x,direction.y)
        })
    }

    setEach(f){

        this.points.forEach(p=>{
            let direction = f(p)
            p.velocity.set(direction.x,direction.y)
        })
    }

    randomize(){
        this.setEach((p)=>random.xy.apply(random, arguments))
    }
}


function faceVelocity(p) {
    const vx = p.velocity.x;
    const vy = p.velocity.y;

    if (vx === 0 && vy === 0) return;


    const angleRad = Math.atan2(vy, vx);


    const angleDeg = angleRad * (180 / Math.PI);


    p.rotation = angleDeg;
}


class Vector {

    constructor(x=0, y=0, parent=undefined) {
        this.x = x
        this.y = y
        this.parent = parent;
    }


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


    set(x, y) {
        if(arguments.length == 1) {
            y = x.y
            x = x.x
        }
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




class PointSpeed {
    constructor(point) {
        this.point = point;
    }

    get xy() {
        let p = this.point
        if(this._speedValue){ return this._speedValue }
        if(!this.previous) {
            this.previous = [p.x, p.y]
            this._moduloTicker = 0
            return this._speedDistance = [0,0]
        }

        let mo = this._moduloTicker++
        let now = [p.x, p.y]
        if(mo % 2 == 0) {
            let prev = this.previous
            let distance = [now[0] - prev[0], now[1] - prev[1]]
            this._speedDistance = distance
        }
        this.previous = now
        return this._speedDistance

    }

    set xy(v) {

        this._speedValue = v
    }

    absolute(multplier=1) {
        return this.xy.map((b)=>Math.abs(b))
    }

    float(multplier=1) {
        return this.xy.reduce((a,b)=>a+b)
    }

    absFloat(multplier=1) {
        return this.xy.reduce((a,b)=>Math.abs(a)+Math.abs(b))
    }

    direction(multplier=1) {

        let d = this._speedDistance?this._speedDistance:[0,0];
        return Math.atan2(d[0] * multplier, d[1] * multplier)
    }
}


Polypoint.head.deferredProp('Point', function speed2D(){
    return new PointSpeed(this);
})


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
;
;


class Emitter extends Point {


    tick = 0


    tickModulo = 20


    particleSpeed = 2


    birthrate = 1











    lifetime = undefined


    fromEdge = false


    direction = {x:1, y:0}

    pointLimit = 2000

    wake() {
        this.points = new PointList

    }

    getDirection(){

        return new Point(isFunction(this.direction)? this.direction(): this.direction)
    }

    step() {

        this.tick += 1

        if(this.tick % this.tickModulo == 0) {
            this.cycle()
        }

        this.points = PointList.from(this.points.filter((p)=> p.age < p.lifetime))
        this.points.forEach((p)=>{
            p.x += p.vx
            p.y += p.vy
            p.age += 1
        })
    }

    cycle() {

        let l = this.points.length
        if(l > this.pointLimit) { return }
        let birthrate = this.birthrate
        for (var i = 0; i < birthrate; i++) {
            let p = this.newPoint(i/birthrate)
            this.pump(p, i, birthrate)
            this.offsetSpawnedPoint(p, i, birthrate)
            this.points.push(p)
        }

        l = this.points.length
        if(this.lastCount != l) {

            this.length = l
        }

        this.lastCount = l
    }

    pump(p, birthIndex, birthrate) {
    }

    newPoint(birthPartial) {

        let fromEdge = this.fromEdge;
        let p = (fromEdge?this.project():this).copy()
        let v = this.particleSpeed
        if(isFunction(v)) {v = v()}



        let FORWARD = this.getDirection()


        const rotatedDir = impartOnRads(this.radians, FORWARD)

        let lifetime = this.lifetime;
        if(lifetime == undefined) {
            lifetime = this.radius * .5;
        }

        p.update({
            age: 0
            , radius: 5
            , lifetime: isFunction(lifetime)?lifetime():lifetime

            , vx: rotatedDir.x * v
            , vy: rotatedDir.y * v
        })

        return p
    }

    offsetSpawnedPoint(p){
        if(this.spawnOffset) {

            const _moved = impartOnRads(p.radians, new Point({x: -1, y:0}))
            p.x += _moved.x * p.radius - (p.vx * this.particleSpeed)
            p.y += _moved.y * p.radius - (p.vy * this.particleSpeed)
        }
    }
}


class LineEmitter extends Emitter {

    radiusVariant = 2
    minSize = 5
    maxSize = 10
    directionVariant = 5
    baseRadius = 5
    baseSpeed = 1
    lifetimeVariant = 2

    wake() {
        this.index = 0
        console.log('Wake')
        super.wake()
    }

    cachePoints(line, divider=1, pointing=0) {

        this.positions = line.split(line.length * divider, pointing)
        this.lineLength = line.length
    }

    newPoint(birthPartial) {
        let choice = this.getChoice()

        let template = this.positions[choice]
        if(!template) {debugger}
        let p = template.copy()
        let v = this.particleSpeed

        let FORWARD = new Point(random.choice([-1, 1]), 0)


        const rotatedDir = impartOnRads(p.radians, FORWARD)

        let lifetime = this.lifetime;
        if(lifetime == undefined) {
            lifetime = this.lineLength * .5;
        }

        p.update({
            age: 0
            , radius: this.baseRadius
            , lifetime: lifetime
            , vx: rotatedDir.x * v
            , vy: rotatedDir.y * v
        })

        return p
    }

    getChoice(){

        let l = this.positions.length
        let choice = (Math.random() * l).toFixed(0)
        if(choice >= l) { choice = l - 1}
        if(choice < 0) { choice = 0}
        return choice
    }

    pump(point, birthIndex, birthrate) {
        let partial = birthIndex / birthrate
        let v = ((1+ partial) * (1+birthIndex)  * Math.random()) * this.directionVariant
        let s = ((1+ partial) * (1+birthIndex)  * Math.random()) * this.baseSpeed
        point.rotation += v * (Math.random()>.488? -1: 1)



        let FORWARD = this.getDirection()



        const rotatedDir = impartOnRads(point.radians, FORWARD)

        point.update({
            radius: clamp(
                        random.int(this.radius * this.radiusVariant)
                        , this.minSize
                        , this.maxSize
                    )
            , vx: rotatedDir.x * s
            , vy: rotatedDir.y * s
            , lifetime: point.lifetime * (Math.random() * this.lifetimeVariant)
        })

        return point
    }

}


class RandomPointEmitter extends Emitter {


    radiusVariant = .1

    directionVariant = 1

    minSize = 2

    pump(point, birthIndex, birthrate) {
        let partial = birthIndex / birthrate
        let v = ((1+ partial) * (1+birthIndex)  * Math.random()) * this.directionVariant
        this.rotation += v
        point.radius = clamp(random.int(this.radius * this.radiusVariant), this.minSize, this.radius)
    }

}


class PumpRandomPointEmitter extends RandomPointEmitter {
    fromEdge = true
    tickModulo = 90
    birthrate = 50
    lifetime = 300
    radiusVariant = .1
    directionVariant = 360
    minSize = 2
}


class DirectionalPointEmitter extends RandomPointEmitter {
    directionVariant = .05
    particleSpeed = .6
    lifetime = 200
    fromEdge = true
    tickModulo = 5

    birthrate = .1
    pointLimit = 1000

    invert = false
    stepDirection(multplier){
        return this.speed2D.direction(multplier)
    }

    step(direction, speedFloat, point){
        super.step()
        let invert = 1 + (-2 * +this.invert)
        direction = direction == undefined? this.stepDirection(invert): direction
        speedFloat = speedFloat == undefined? this.speed2D.absFloat(): speedFloat
        this.rotation = 90 - radiansToDegrees(direction)

        let v = speedFloat == undefined ? Math.abs(direction[0])+Math.abs(direction[1]): speedFloat
        let vh = (v * .5)
        this.birthrate = v < 1? 0: .1

        this.particleSpeed = 1 + (vh * .1)
        this.radiusVariant = .1 + (vh * .02)

        if(point) {
            this.lifetime = (this.distanceTo(point) - vh) * .4
        }
    }
}


class TrailPointEmitter extends DirectionalPointEmitter {
    invert = true

}


;
;class Gradient {



    constructor(ctx, type='Linear', originPoints=[]) {
        this.ctx = ctx
        this.type = type
        this.stopMap = new Map()
        this.originPoints = originPoints
    }



    conic(point) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Conic'
        this._gradient = undefined
        return this
    }



    linear(pointA, pointB) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Linear'
        this._gradient = undefined
        return this
    }



    radial(pointA, pointB) {
        let given = Array.from(arguments)
        if(given.length > 0){ this.originPoints = given }

        this.type = 'Radial'
        this._gradient = undefined
        return this
    }

    getObject(ctx=this.ctx) {
        let res = this._gradient;

        if(res) {
            return res
        }


        let argsFuncName = `generate${this.type}Args`
        if(this[argsFuncName] == undefined) {
            console.error('Function does not exist,', argsFuncName)
        }

        const args = this[argsFuncName]()

        let canvasFuncName = `create${this.type}Gradient`
        res = this._gradient = ctx[canvasFuncName].apply(ctx, args)
        this.installStops(res)
        return res
    }

    installStops(gradient, stopMap=this.stopMap) {

        this.stopMap.forEach((v, k) => {
            gradient.addColorStop(k, v.color || v);
        })
    }

    generateLinearArgs() {


        let origins = this.originPoints
        let inner = origins[0]
        let outer = origins[1]

        if(outer == undefined) {


            [inner, outer] = inner.split(2)
        }

        return [
            inner.x, inner.y,
            outer.x, outer.y,
        ]
    }

    generateConicArgs() {

        let o = this.originPoints[0]
        return [
            o.radians, o.x, o.y
        ]
    }

    generateRadialArgs() {


        let origins = this.originPoints
        let inner = origins[0]
        let outer = origins[1]

        if(outer == undefined) {
            outer = inner;
            inner = inner.copy().update({radius: 0})
        }

        return [
            inner.x, inner.y, inner.radius,
            outer.x, outer.y, outer.radius,
        ]
    }

    addStops(dict) {
        for(let k in dict) {
            this.stopMap.set(Number(k), dict[k])
        }
    }
}


;
;
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = this.center.copy()
















        let e1 = this.e1 = new RandomPointEmitter()
        e1.update({
            x: this.point.x
            , y: this.point.y
            , radius: 230

            , directionVariant: 100
            , particleSpeed: .6
            , lifetime: 200
            , fromEdge: true
            , spawnOffset: true
            , tickModulo: 2

            , birthrate: .6
            , pointLimit: 1000
        })

        e1.wake()



        this.e1 = e1
        this.g = (new Gradient).radial(this.e1)



        let c1 = '#fbc148'
        let c2 = '#eab510'

        this.g.addStops({
            0: {color: c1}
            ,1: {color: c2}

        })


        this.dragging.add(this.point, this.e1)
    }

    draw(ctx){
        this.clear(ctx)
        this.e1.step()
        this.g.radial()
        let grad = this.g.getObject(ctx)

















        let rCol = function(){
            let lr = random.int(20, 21)
            let c2 = `hsl(21deg 97% ${lr}%)`
            return c2;
        }


        this.e1.points.pen.fill(ctx, grad)
        this.e1.pen.fill(ctx, grad)







    }
}


stage = MainStage.go()


}());
;
