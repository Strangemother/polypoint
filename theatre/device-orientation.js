
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(200, 100, 20)

    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}

window.addEventListener('deviceorientation', handleOrientation);

function handleOrientation(event) {
    const spin = alpha = event.alpha; // flat on its back
    const pitch = beta = event.beta; // pitch forward
    const roll = gamma = event.gamma; // roll
    // Do stuff...
    console.log(spin, pitch, roll, )
}

stage = MainStage.go(/*{ loop: true }*/)

