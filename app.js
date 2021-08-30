let select = s => document.querySelector(s),
    selectAll = s =>  document.querySelectorAll(s),
    mainSVG = select('#mainSVG'),
    pContainer = select('#pContainer')

gsap.set('svg', {
    visibility: 'visible'
})
let maxDragY = -116;
let maxDragX = 600;
let draggable;
let numParticles = 90;
let particlePool = [];
let particleColorArray = ['#EB5E55', '#FFB258', '#3FA9F5','#4CB4A4','#FFE675'];
let particleTypeArray = ['#star','#circ','#cross','#heart'];
let blendEases= (startEase, endEase, blender) => {
    var s = gsap.parseEase(startEase),
        e = gsap.parseEase(endEase),
        blender = gsap.parseEase(blender || "power3.inOut");
    return function(v) {
        var b = blender(v);
        return s(v) * (1 - b) + e(v) * b;
    };
}
gsap.set('#gifts', {
    transformOrigin: '50% 100%'
})
gsap.set('#faceMask', {
    rotation: 34,
    transformOrigin: '50% 50%'
})
let createParticles = () => {
    pulseDragger()
    let i = numParticles, p, particleTl;
    while (--i > -1) {

        p = select(particleTypeArray[i%particleTypeArray.length]).cloneNode(true);
        pContainer.appendChild(p);
        particlePool.push(p);
        //hide them initially
        gsap.set(p, {
            x:400,
            y:500,
            scale:10,
            fill: particleColorArray[i % particleColorArray.length],
            transformOrigin:'50% 50%'
        })



    }

}
let explode = () => {
    gsap.set('.particle', {
        x:400,
        y:360,
        scale: 10,
    })
    mainSVG.appendChild(pContainer)
    particlePool.forEach((p, count) => {
        gsap.to(p, {
            duration: 'random(1, 4)',
            rotation: 'random(-723, 1720)',
            physics2D: {
                velocity: 'random(800, 1816)',
                angle:'random(-115, -65)',
                gravity: 2980
            },
            scale: 0,
            ease: 'expo'
        })
    })
}
let allGifts = gsap.utils.toArray('.gift');
let randomGiftId = gsap.utils.random(0, allGifts.length-1, 1, true);
let choose = () => {
    let giftId = randomGiftId();
    gsap.set(allGifts, {
        autoAlpha: (count, el) => {
            //console.log(giftId)
            return (count == giftId) ? 1 : 0
        }
    })
}
let handleEase = blendEases('sine.in', 'linear', 'power1');
let handleTl = gsap.timeline({
    paused: true,
    defaults: {
        ease: 'sine.inOut'
    }
});
handleTl.to('#bar', {
    morphSVG: {
        shape: '#barEnd'
    },
    repeat: 10,
    yoyo: true
}, 0)
    .to('#handle', {
        y: maxDragY,
        scale: 0.79,
        transformOrigin: '0% 50%',
        repeat: 10,
        yoyo: true
    },0)

let popTl = gsap.timeline({
    paused: true
});
popTl
    .add('pop')
    .to('#lid', {
        rotation: -97,
        transformOrigin: '0% 50%',
        ease: 'elastic(0.83, 0.8)'
    }, 'pop-=0.045')
    .from('#gifts', {
        y: 200,
        scale: 0,
        duration: 1,
        ease: 'elastic(0.83, 0.28)'
    }, 'pop')
    .from('#gifts', {
        rotation: -40,
        x: 30,
        duration: 1,
        ease: 'elastic(0.83, 0.28)'
    }, 'pop')
    .from('#spring', {
        transformOrigin: '50% 100%',
        scaleY: 0,
        duration: 1,
        ease: 'elastic(0.83, 0.28)'
    }, 'pop')
    //roll secondary
    .to('#rollLip', {
        morphSVG: {
            shape: '#rollLipEnd'
        },
        duration: 0.85,
        ease: 'wiggle({wiggles:6, type: easeOut})'
    }, 'pop')
    //mask secondary
    .to(['#flapL', '#flapR'], {
        scaleX: 0.5,
        transformOrigin: gsap.utils.wrap(['100% 50%', '0% 50%']),
        duration: gsap.utils.wrap([0.85, 1]),
        ease: 'wiggle({wiggles:6, type: easeOut})'
    }, 'pop')
    .to('#whole', {
        rotation: -2,
        duration: 0.1,
        transformOrigin: '0% 100%'
    }, 'pop')

    .to('#whole', {
        rotation: 0,
        duration: 0.1,
        ease: 'power1.in',
        transformOrigin: '0% 100%'
    }, 'pop+=' + popTl.recent().duration())
/* .from('#heart', {
	scale: 0,
	duration: 1,
	transformOrigin: '0% 90%',
	ease: 'elastic(0.6, 0.5)'
}) */
let pulseDragger = () => {
    gsap.to('#dragger', {
        scale: 1.2,
        transformOrigin: '50% 50%',
        duration: 1,
        ease: 'wiggle({wiggles: 6, type: easeOut})'
    })
}

let onUpdate = () => {
    let progress = gsap.getProperty('#dragger', 'x')/maxDragX;
    handleTl.progress(progress);
    console.log(progress)
    if(progress == 1) {
        choose();
        popTl.play();
        explode();
        draggable[0].disable();
        gsap.delayedCall(3, () => {
            let revTl = gsap.timeline();
            revTl.to(popTl, {
                time: 0,
                duration: 1
            }).to(handleTl, {
                time: 0,
                duration: 1
            }, 0)
                .to('#dragger', {
                    x: 0,
                    onComplete: () => {
                        draggable[0].enable();
                        popTl.pause();
                        pulseDragger();
                    },
                    duration: 1
                }, 0)
        })
    }
}
draggable = Draggable.create('#dragger', {
    type: 'x',
    bounds: {
        minX: 0, maxX: maxDragX
    },
    onDrag: onUpdate
})
createParticles();
/* document.body.onclick = (e) => {
	tl.play(0)
} */
//ScrubGSAPTimeline(tl)