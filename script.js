// Verificar se os elementos existem
const canvas = document.getElementById("rocketCanvas");
if (!canvas) {
    console.error("Canvas não encontrado!");
}

const ctx = canvas ? canvas.getContext("2d") : null;

const power = document.getElementById("power");
const mass = document.getElementById("mass");
const angle = document.getElementById("angle");

const powerValue = document.getElementById("powerValue");
const massValue = document.getElementById("massValue");
const angleValue = document.getElementById("angleValue");

const altitudeElement = document.getElementById("altitude");
const velocityElement = document.getElementById("velocity");
const timeElement = document.getElementById("time");

const launchButton =
    document.getElementById("launchButton");

const resetButton =
    document.getElementById("resetButton");


/* VALORES */

let altitude = 0;
let velocity = 0;
let simulationTime = 0;

let rocketX = 0;
let rocketY = 0;

let running = false;

let animation;


/* AJUSTAR CANVAS */

function resizeCanvas() {
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.max(550, rect.height);

    rocketX = canvas.width / 2;
    rocketY = canvas.height - 80;
}

window.addEventListener("resize", resizeCanvas);

// Aguardar carregamento completo da página
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resizeCanvas);
} else {
    resizeCanvas();
}


/* ATUALIZAR SLIDERS */

if (power) {
    power.addEventListener(
        "input",
        () => {
            if (powerValue) {
                powerValue.textContent =
                    power.value + "%";
            }
        }
    );
}

if (mass) {
    mass.addEventListener(
        "input",
        () => {
            if (massValue) {
                massValue.textContent =
                    mass.value + " kg";
            }
        }
    );
}

if (angle) {
    angle.addEventListener(
        "input",
        () => {
            if (angleValue) {
                angleValue.textContent =
                    angle.value + "°";
            }
            // Redesenhar imediatamente
            draw();
        }
    );
}


/* DESENHAR CÉU */

function drawBackground() {
    if (!ctx || !canvas) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* estrelas */

    for(let i = 0; i < 80; i++) {

        const x =
            (i * 137) %
            canvas.width;

        const y =
            (i * 71) %
            canvas.height;

        ctx.fillStyle = "white";

        ctx.globalAlpha =
            0.3 + (i % 5) / 10;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            1.2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;


    /* planeta / solo */

    ctx.fillStyle = "#0f172a";

    ctx.fillRect(
        0,
        canvas.height - 35,
        canvas.width,
        35
    );

}


/* DESENHAR FOGUETE */

function drawRocket() {
    if (!ctx) return;

    ctx.save();

    ctx.translate(
        rocketX,
        rocketY
    );

    ctx.rotate(
        -(Number(angle.value) - 90)
        * Math.PI / 180
    );

    /* corpo */

    ctx.fillStyle = "#e2e8f0";

    ctx.beginPath();

    ctx.moveTo(0, -35);

    ctx.lineTo(13, -10);

    ctx.lineTo(13, 30);

    ctx.lineTo(-13, 30);

    ctx.lineTo(-13, -10);

    ctx.closePath();

    ctx.fill();


    /* ponta */

    ctx.fillStyle = "#38bdf8";

    ctx.beginPath();

    ctx.moveTo(0, -50);

    ctx.lineTo(13, -35);

    ctx.lineTo(-13, -35);

    ctx.closePath();

    ctx.fill();


    /* janela */

    ctx.fillStyle = "#0ea5e9";

    ctx.beginPath();

    ctx.arc(
        0,
        -18,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* chama */

    if(running) {

        const flameHeight =
            20 + Math.random() * 25;

        // Chama vermelha/laranja externa
        ctx.fillStyle = "#f97316";

        ctx.beginPath();

        ctx.moveTo(-8, 30);

        ctx.lineTo(0, 30 + flameHeight);

        ctx.lineTo(8, 30);

        ctx.lineTo(5, 35);

        ctx.lineTo(0, 30 + flameHeight * 0.8);

        ctx.lineTo(-5, 35);

        ctx.closePath();

        ctx.fill();

        // Chama amarela interna
        ctx.fillStyle = "#fde047";

        ctx.beginPath();

        ctx.moveTo(-4, 30);

        ctx.lineTo(0, 30 + flameHeight * 0.65);

        ctx.lineTo(4, 30);

        ctx.closePath();

        ctx.fill();

    }

    ctx.restore();

}


/* DESENHAR */

function draw() {
    if (!ctx) return;

    drawBackground();

    drawRocket();

}


/* FÍSICA SIMPLIFICADA */

function updatePhysics() {

    const motorForce =
        Number(power.value) * 2.5;

    const rocketMass =
        Number(mass.value);

    const gravity = 9.81;


    /*
        Segunda lei de Newton:

        F = m × a

        portanto:

        a = F / m
    */

    const acceleration =
        motorForce /
        rocketMass;


    /*
        aceleração resultante
        considerando a gravidade
        (dividido por 50 para escala)
    */

    const netAcceleration =
        (acceleration - gravity) / 50;


    velocity +=
        netAcceleration * 0.05;


    altitude +=
        velocity * 0.05;


    /* impedir altitude negativa */

    if(altitude < 0) {

        altitude = 0;

        velocity = 0;

    }


    simulationTime += 0.05;


    /*
        posição visual

        usamos uma escala para que
        o foguete permaneça visível
    */

    const scale = 2;

    rocketY =
        canvas.height -
        80 -
        altitude * scale;


    /*
        limite visual
    */

    if(rocketY < 80) {

        rocketY = 80;

    }


    altitudeElement.textContent =
        altitude.toFixed(1);

    velocityElement.textContent =
        Math.max(0, velocity).toFixed(1);

    timeElement.textContent =
        simulationTime.toFixed(2);

}


/* LOOP */

function animate() {

    if(!running)
        return;

    updatePhysics();

    draw();

    /*
        quando o foguete
        retorna ao solo
    */

    if(
        altitude <= 0 &&
        simulationTime > 1
    ) {

        running = false;
        
        // Resetar para posição final
        altitudeElement.textContent = "0";
        velocityElement.textContent = "0";

        return;

    }

    animation =
        requestAnimationFrame(
            animate
        );
}


/* LANÇAR */

if (launchButton) {
    launchButton.addEventListener(
        "click",
        () => {

            if(running)
                return;

            running = true;

            altitude = 0;

            velocity = 0;

            simulationTime = 0;

            rocketY =
                canvas.height - 80;

            animate();

        }
    );
}


/* RESET */

if (resetButton) {
    resetButton.addEventListener(
        "click",
        () => {

            running = false;

            cancelAnimationFrame(
                animation
            );

            altitude = 0;

            velocity = 0;

            simulationTime = 0;

            rocketY =
                canvas.height - 80;

            if (altitudeElement) 
                altitudeElement.textContent = "0";

            if (velocityElement) 
                velocityElement.textContent = "0";

            if (timeElement) 
                timeElement.textContent = "0";

            draw();

        }
    );
}


/* PRIMEIRO DESENHO */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw);
} else {
    draw();
}