/*
title: 3D Solar System — Drag to Orbit
category: astronomy
files:
    head
    point
    stage
---
Visual polish: precomputed starry Milky Way strip, soft solar glow, planet sunward highlights and shadow-side shading, Earth's atmosphere, and Saturn's rings. Stylised axial-spin hands replace orbital tangent arrows. NASA sidereal rotation periods, illustrative clock at 5 spin-hours per real second, independent of orbit clock. Venus/Uranus/Pluto retrograde. Interactive perspective view of a dated planetary longitude snapshot (26 Oct 2026 15:30 UTC). Ring radii evenly spaced, marker sizes enlarged, angles carried forward from the previous chart. Schematic, not a physically scaled 3D ephemeris. Click-drag to orbit; animated at one simulated month per real second using approximate mean orbital periods; capped at 12 fps.
*/
class MainStage extends Stage {
 canvas="playspace"
 bodies=[
 ['MERCURY','#abb7c2',3.4,355.089],['VENUS','#e8bd87',5,34.733],
 ['EARTH','#5eb7ff',5.6,33.231],['MARS','#eb7c5b',4.4,98.233],
 ['JUPITER','#d3ad89',9,133.546],['SATURN','#e9d49d',8,12.055],
 ['URANUS','#82dadd',6.7,63.322],['NEPTUNE','#6b91f7',6.6,3.179],
 ['PLUTO','#b8a5a0',3.8,304.698]
 ]
 spins=[1407.6,-5832.5,23.9,24.6,9.9,10.7,-17.2,16.1,-153.3]
 spinHours=0
 periods=[.240846,.615198,1.000017,1.880847,11.8626,29.4475,84.0168,164.791,247.94]
 months=0
 lastTick=null
 lastPaint=0
 paused=false
 yaw=.35
 tilt=.85
 zoom=1
 dirty=true
 initialized=false
 dragging=false
 setup(canvas){
  if(this.initialized)return
  this.initialized=true
  canvas.style.touchAction='none'
  canvas.style.cursor='grab'
  canvas.tabIndex=0
  canvas.title='Drag to rotate, scroll to zoom, click to pause or resume, R to reset date'
  canvas.addEventListener('click',()=>{if(!this.draggingMoved){this.paused=!this.paused;this.dirty=true}})
  canvas.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'){this.months=0;this.dirty=true}})
  canvas.addEventListener('pointerdown',e=>{
   this.dragging=true;this.draggingMoved=false;this.px=e.clientX;this.py=e.clientY
   canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'
  })
  canvas.addEventListener('pointermove',e=>{
   if(!this.dragging)return
   if(Math.abs(e.clientX-this.px)+Math.abs(e.clientY-this.py)>2)this.draggingMoved=true
   this.yaw+=(e.clientX-this.px)*.008
   this.tilt=Math.max(.08,Math.min(Math.PI-.08,this.tilt+(e.clientY-this.py)*.008))
   this.px=e.clientX;this.py=e.clientY;this.dirty=true
  })
  const stop=()=>{this.dragging=false;canvas.style.cursor='grab'}
  canvas.addEventListener('pointerup',stop)
  canvas.addEventListener('pointercancel',stop)
  canvas.addEventListener('lostpointercapture',stop)
  canvas.addEventListener('wheel',e=>{
    e.preventDefault()
    this.zoom=Math.max(.5,Math.min(1.8,this.zoom*(e.deltaY>0?.91:1.1)))
    this.dirty=true
  },{passive:false})
 }
 project(x,y,r,cx,cy){
  const a=this.yaw
  const xr=x*Math.cos(a)-y*Math.sin(a)
  const yr=x*Math.sin(a)+y*Math.cos(a)
  const height=yr*Math.cos(this.tilt)
  const z=yr*Math.sin(this.tilt)
  const perspective=3.3/(3.3-z)
  return {x:cx+xr*r*perspective,y:cy+height*r*perspective,z:z}
 }
 draw(ctx){
  this.setup(ctx.canvas)
  const now=performance.now()
  if(this.lastTick===null)this.lastTick=now
  const dt=Math.max(0,Math.min(.25,(now-this.lastTick)/1000))
  this.lastTick=now
  if(!this.paused){this.months+=dt;this.spinHours+=dt*5}
  if(!this.dirty && (this.paused || now-this.lastPaint<83))return
  this.lastPaint=now
  this.dirty=false
  const w=ctx.canvas.width,h=ctx.canvas.height
  ctx.fillStyle='#06101e';ctx.fillRect(0,0,w,h)
  // Lightweight Milky Way backdrop: deterministic sparse points, no blur or sprites.
  ctx.save()
  for(let i=0;i<130;i++){
   const sx=((i*7919+1049)%10007)/10007*w
   const yband=h*(.24+.49*(sx/w))
   const offset=(((i*3571+691)%10009)/10009-.5)*h*.14
   ctx.fillStyle=i%5===0?'rgba(170,192,236,.28)':'rgba(125,157,213,.12)'
   ctx.fillRect(sx,yband+offset,1.5,1.5)
  }
  ctx.restore()
  for(let i=0;i<90;i++){
   const x=((i*7919+1049)%10007)/10007*w,y=((i*3571+691)%10009)/10009*h
   ctx.fillStyle='#34455d';ctx.fillRect(x,y,1,1)
  }
  ctx.textAlign='center'
  ctx.fillStyle='#e9f3ff'
  ctx.font='bold '+Math.max(17,Math.min(30,w*.036))+'px sans-serif'
  ctx.fillText('OUR SOLAR SYSTEM IN 3D',w*.5,h*.075)
  ctx.fillStyle='#b7c6d8'
  ctx.font=Math.max(11,Math.min(16,w*.016))+'px sans-serif'
  const date=new Date(Date.UTC(2026,9,26,15,30)+this.months*30.436875*86400000)
  const dateText=date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).toUpperCase()
  ctx.fillText(dateText+'  •  1 MONTH / SECOND  •  '+(this.paused?'PAUSED':'PLAYING'),w*.5,h*.12)
  const cx=w*.41,cy=h*.53,R=Math.min(w*.31,h*.39)*this.zoom
  ctx.strokeStyle='#394d66';ctx.lineWidth=1
  for(let j=1;j<=9;j++){
   ctx.beginPath()
   for(let k=0;k<=100;k++){
    const a=k*Math.PI*2/100
    const p=this.project(Math.cos(a)*j/9,Math.sin(a)*j/9,R,cx,cy)
    if(k===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)
   }
   ctx.stroke()
  }
  const planets=this.bodies.map((b,i)=>{
   const a=(b[3]+this.months*30/this.periods[i])*Math.PI/180
   return {b,i,p:this.project(Math.cos(a)*(i+1)/9,Math.sin(a)*(i+1)/9,R,cx,cy),next:this.project(Math.cos(a+.04)*(i+1)/9,Math.sin(a+.04)*(i+1)/9,R,cx,cy)}
  }).sort((a,b)=>a.p.z-b.p.z)
  const sunR=Math.max(4,Math.min(10,R/26))
  // Solar glow via concentric transparent circles, avoiding expensive shadowBlur.
  for(let j=5;j>=1;j--){ctx.fillStyle='rgba(255,174,52,'+(0.018+(6-j)*.008)+')';ctx.beginPath();ctx.arc(cx,cy,sunR+j*3,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#ffce59';ctx.beginPath();ctx.arc(cx,cy,sunR,0,Math.PI*2);ctx.fill()
  planets.forEach(({b,i,p,next})=>{
    const radius=Math.max(3,Math.min(b[2],R/9*.50))
    ctx.fillStyle=b[1];ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill()
    // Lit hemisphere faces the Sun; dark hemisphere sits away from it.
    const towardX=cx-p.x,towardY=cy-p.y,dist=Math.hypot(towardX,towardY)||1
    const lightX=towardX/dist,lightY=towardY/dist
    ctx.save()
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.clip()
    const shade=ctx.createLinearGradient(p.x+lightX*radius,p.y+lightY*radius,p.x-lightX*radius,p.y-lightY*radius)
    shade.addColorStop(0,'rgba(255,255,255,.40)')
    shade.addColorStop(.48,'rgba(0,0,0,.06)')
    shade.addColorStop(1,'rgba(0,0,0,.78)')
    ctx.fillStyle=shade;ctx.fillRect(p.x-radius,p.y-radius,radius*2,radius*2)
    ctx.restore()
    if(i===2){ctx.strokeStyle='rgba(99,207,255,.65)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(p.x,p.y,radius+1.7,0,Math.PI*2);ctx.stroke()}
    // Stylised clock hand pinned to the planet centre: axial rotation.
    // Spin uses a second, slower time scale to avoid motion aliasing.
    const phase=(this.spinHours/this.spins[i])*Math.PI*2
    const len=Math.max(9,radius+7)
    const ux=Math.cos(phase),uy=Math.sin(phase)
    const tipX=p.x+ux*len,tipY=p.y+uy*len
    ctx.strokeStyle='#a8f7d5';ctx.lineWidth=2
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(tipX,tipY);ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(tipX,tipY)
    ctx.lineTo(tipX-5*ux+3*uy,tipY-5*uy-3*ux)
    ctx.moveTo(tipX,tipY)
    ctx.lineTo(tipX-5*ux-3*uy,tipY-5*uy+3*ux)
    ctx.stroke()
    if(i===5){ctx.strokeStyle='rgba(234,213,160,.82)';ctx.lineWidth=2.5
      ctx.beginPath();ctx.ellipse(p.x,p.y,radius*1.8,radius*.5,-.2,0,Math.PI*2);ctx.stroke()}
  })
  const lx=w*.79,top=h*.21,fs=Math.max(10,Math.min(16,w*.017))
  ctx.textAlign='left';ctx.font='bold '+fs+'px sans-serif'
  ctx.fillStyle='#ffcf65';ctx.fillText('SUN',lx,top)
  this.bodies.forEach((b,i)=>{ctx.fillStyle=b[1];ctx.fillText(b[0],lx,top+(i+1)*Math.min(h*.068,fs*1.8))})
  ctx.textAlign='center';ctx.fillStyle='#9aaec7'
  ctx.font=Math.max(10,Math.min(14,w*.014))+'px sans-serif'
  ctx.fillText('DRAG TO ORBIT  •  CLICK TO PAUSE  •  ILLUSTRATIVE SIZES, DISTANCES AND LIGHTING',w*.5,h*.95)
 }
}
const stage=MainStage.go()