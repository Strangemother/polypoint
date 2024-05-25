// total number of nodes
var numNodes = 27;

// the general size and speed
var head  = 2 + Math.floor(Math.random()*4);
var girth = 8 + Math.floor(Math.random()*12);
// locomotion efficiency (0 - 1)
var speedCoefficient =.09 + Math.floor((Math.random()*10)/50);
// the viscosity of the water (0 - 1)
var friction = .90 + Math.floor((Math.random()*10)/100);
// muscular range
var muscleRange = 20 + Math.floor(Math.random()*50);
// muscular frequency
var muscleFreq = .1 + Math.floor((Math.random()*100)/250);
// create point array to represent nodes
var nodes = [];
var theta = 0;
var count = 0;

const generateNodes = function(offset=0) {
    nodes = [];
    for (var n = 0; n < numNodes; n++) {
        let point = {x:offset,y:offset};
        nodes.push(point);
    }
}


const tentacle = function(){
    generateNodes()
    moveHandler()
    ctx.strokeStyle = 'red'
    ctx.stroke()
}

function moveHandler(offset=100){
    // directional node with orbiting handle
    // arbitrary direction

    let rightPeak = 5
    let leftPeak =  5

    head = 1
    muscleFreq = 1 * ((i%2==0) ? leftPeak * (1 - rightPeak) : (1 - leftPeak) * rightPeak);
    // let tv = 0.5*(Math.random()-Math.random());
    // theta += tv;
    // tv *= friction;

    nodes[0].x = (head * Math.cos(Math.PI / 180 * theta))
    nodes[0].y = (head * Math.sin(Math.PI / 180 * theta))

    ctx.beginPath();

    // muscular node
    count += muscleFreq;

    var thetaMuscle = muscleRange * Math.sin(count);

    let pitt = Math.PI / 180 * (theta + thetaMuscle)

    nodes[1].x = ( -head * Math.cos(pitt))
    nodes[1].y = ( -head * Math.sin(pitt))

    // apply kinetic forces down through body nodes
    for (var i = 2; i<numNodes; i++){
        var dx = nodes[i].x - nodes[i - 2].x;
        var dy = nodes[i].y - nodes[i - 2].y;

        var d = Math.sqrt(dx * dx + dy * dy);
        nodes[i].x = (nodes[i - 1].x + (dx * girth) / d)
        nodes[i].y = (nodes[i - 1].y + (dy * girth) / d)
    }

    // draw nodes using lines
    // this.graphics.clear();
    ctx.moveTo(nodes[1].x + offset, nodes[1].y + offset);
    for (var j = 2; j<numNodes; j++){
        //    this.lineStyle((this.numNodes/(i-1))*1.5, 0xFFFFFF, 100);  // with head
        //    this.lineStyle((this.numNodes-i), 0xFFFFFF, 100);  // with no head
        // ctx.lineWidth = Number(numNodes-j)*(numNodes-j)/2//, 0x000000, 1);  // with no head
        ctx.lineTo(nodes[j].x + offset,nodes[j].y + offset);
    }
};
