const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight
let started = false
let numPendulums = 4
let pendulums 
let reverb, filter


function setup(){
    createCanvas(canvasWidth, canvasHeight) 
    reverb = new p5.Reverb()
    filter = new p5.LowPass();
    reverb.drywet(0.9)
    pendulums  = Array.from({ length: numPendulums}, (el, i) => createPendulum(i))

    // updatePendulumAngle(pendulum)
    pendulums.forEach((pendulum, i) => {
        pendulum.synth = createSynth(i)
        updatePendulumAngle(pendulum)
        updatePendulumPosition(pendulum)
        drawPendulum(pendulum)
    })


 

}

function draw(){
    background(30)
    if(started){
        
        pendulums.forEach(pendulum => {
            if(!pendulum.ended){
                updatePendulumAngle(pendulum)
                updatePendulumPosition(pendulum)
                updateSynth(pendulum.angle, pendulum.synth)
                drawPendulum(pendulum)
            }else{
                pendulum.synth.osc.amp(0)
                pendulum.synth.mod.amp(0)
            }
 
        })
    } else {
        drawText()
    }
    pendulums.forEach(pendulum => {
        // updatePendulumAngle(pendulum)
        // updatePendulumPosition(pendulum)
        drawPendulum(pendulum)
    })
}


function mousePressed(){
    if(!started){
        started = true
    }

    pendulums.forEach(pendulum => {
        pendulum.synth.osc.start()
        pendulum.synth.osc.disconnect()
        pendulum.synth.mod.start()
        pendulum.synth.mod.disconnect()
        reverb.process(pendulum.synth.osc, 1.5, 60)
       
    })

}

const drawText = () => {
    textSize(30)
    fill(255)
    noStroke()
    text('click anywhere to start', 100, canvasHeight - 100)
}

const drawBall = (pendulum) => {
    fill(pendulum.color)
    ellipse(pendulum.center.x, pendulum.center.y, pendulum.size)
}

const drawLine = (pendulum) => {
    stroke(255)
    strokeWeight(3)
    line(pendulum.lineStart.x, pendulum.lineStart.y, pendulum.center.x, pendulum.center.y)
}


const drawPendulum = (pendulum) => {
    if(!pendulum.ended){
        drawLine(pendulum)
        drawBall(pendulum)
    }

}

const updatePendulumAngle = (pendulum) => {
    // a formula that I didn't make up
    // (see: http://www.myphysicslab.com/pendulum1.html)
    pendulum.acceleration = (-1 * pendulum.gravity/pendulum.size) * sin(pendulum.angle)
    pendulum.velocity += pendulum.acceleration
    pendulum.damping -= 0.000001
    pendulum.velocity *= pendulum.damping
    pendulum.prevAngle = pendulum.angle
    pendulum.angle += pendulum.velocity
    // if(Math.abs(pendulum.prevAngle - pendulum.angle < 0.0001)){
    //     pendulum.ended = true
    // }
    
}


const updatePendulumPosition = (pendulum) => { 

    // polar to cartesian conversion
    // (in other words, mapping a slice of a circle onto x y coordinates)
    pendulum.center.x = pendulum.swingRadius * sin(pendulum.angle) + pendulum.origin.x
    pendulum.center.y = pendulum.swingRadius * cos(pendulum.angle) + pendulum.origin.y
    // console.log(pendulum.swingRadius, pendulum.angle, pendulum.origin.y)
    // console.log(y)
    // return {
    //     x, y
    // }
}


const createSynth = (i) => {
    const osc = new p5.Oscillator('sine')
    const mod = new p5.Oscillator('sine')
    const modBaseFreq = random(100, 200)
    const modAmp = random(150,350)
    return {
        id: i,
        osc,
        mod,
        modBaseFreq,
        modAmp,
    }
}

const updateSynth = (angle, synth) => {
    const newFreq = Math.abs(sin(angle) * synth.modBaseFreq)
    if(random(0.0,1.0) > 0.2){
        synth.mod.amp(random(-synth.modAmp, synth.modAmp), 0.01)
    }
     synth.mod.freq(newFreq)
    // synth.mod.amp(synth.amp, 0.01)    
    synth.osc.freq(synth.mod)
    // console.log(angle)

    let amplt = map(Math.abs(angle), PI/2, 0, 0, 1.0)
    if(amplt > 0.8 ){
        synth.osc.amp(amplt , 0.001)
    }else{
        synth.osc.amp(0,0.001)
    }
   
    
    synth.mod.amp(0)
}


const createPendulum = (idx) => {
    const randomY = random(50, 100)
    return {
        // geometries
        id: idx,
        origin: {x: canvasWidth/2, y: (idx + 1)  * randomY},
        center: {x: canvasWidth/2, y: 200},
        lineStart: {x: canvasWidth/2, y: (idx + 1)  * randomY},
        size: (idx + 1)  * 100,
        swingRadius: (idx + 1) * 150,
        color: [(idx + 1)  * 50, 0, (idx + 1)  * 50, 60],
        // physics
        gravity: 0.9,
        damping: 0.99995,
        angle: Math.PI/(idx + 1) ,
        acceleration: 0,
        velocity: 0,
        // synth
        synth: null,
        ended: false,
    }
}