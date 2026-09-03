// ==========================================
// ROCKETLAB - SIMULADOR
// ==========================================

const canvas = document.getElementById("rocketCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const power = document.getElementById("power");
const mass = document.getElementById("mass");
const angle = document.getElementById("angle");

const powerValue = document.getElementById("powerValue");
const massValue = document.getElementById("massValue");
const angleValue = document.getElementById("angleValue");

const launchButton = document.getElementById("startSimulationButton");
const resetButton = document.getElementById("resetButton");

const altitudeElement = document.getElementById("altitude");
const velocityElement = document.getElementById("velocity");
const timeElement = document.getElementById("time");


// ==========================================
// VARIÁVEIS DA SIMULAÇÃO
// ==========================================

let altitude = 0;
let velocity = 0;
let simulationTime = 0;
let horizontalDistance = 0;
let verticalVelocity = 0;
let horizontalVelocity = 0;

let rocketX = 0;
let rocketY = 0;

let running = false;
let lastTime = 0;
let simulationStars = [];
let spacePlanets = [];

const gravity = 9.81;


// ==========================================
// TAMANHO DO CANVAS
// ==========================================

function resizeCanvas() {

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    simulationStars = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.78,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3
    }));

    spacePlanets = [
        {
            x: canvas.width * 0.16,
            y: canvas.height * 0.22,
            radius: Math.min(canvas.width, canvas.height) * 0.08,
            color: "#f97316",
            ring: "#fdba74"
        },
        {
            x: canvas.width * 0.82,
            y: canvas.height * 0.42,
            radius: Math.min(canvas.width, canvas.height) * 0.055,
            color: "#38bdf8",
            ring: "#bae6fd"
        }
    ];

    drawScene();
}

window.addEventListener("resize", resizeCanvas);


// ==========================================
// ATUALIZAR VALORES DOS SLIDERS
// ==========================================

function updateSliderValues() {

    if (power && powerValue) {
        powerValue.textContent = `${power.value}%`;
    }

    if (mass && massValue) {
        massValue.textContent = `${mass.value} kg`;
    }

    if (angle && angleValue) {
        angleValue.textContent = `${angle.value}°`;
    }
}

if (power) {
    power.addEventListener("input", updateSliderValues);
}

if (mass) {
    mass.addEventListener("input", updateSliderValues);
}

if (angle) {
    angle.addEventListener("input", updateSliderValues);
}


// ==========================================
// ATUALIZAR PAINEL
// ==========================================

function updateDataPanel() {

    if (altitudeElement) {
        altitudeElement.textContent = altitude.toFixed(1);
    }

    if (velocityElement) {
        velocityElement.textContent = velocity.toFixed(1);
    }

    if (timeElement) {
        timeElement.textContent = simulationTime.toFixed(1);
    }
}


// ==========================================
// CENÁRIO
// ==========================================

function drawScene() {

    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#0f172a");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Estrelas com posições aleatórias estáveis durante o voo
    simulationStars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Planetas distantes para reforçar a perspectiva espacial
    spacePlanets.forEach(planet => {
        ctx.globalAlpha = Math.min(1, 0.25 + altitude / 500);
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = planet.ring;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
            planet.x,
            planet.y,
            planet.radius * 1.45,
            planet.radius * 0.35,
            -0.2,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    });

    ctx.globalAlpha = 1;


    // Lua
    ctx.beginPath();

    ctx.arc(
        canvas.width - 80,
        70,
        30,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#e2e8f0";

    ctx.fill();


    // O chão desaparece conforme o foguete ganha altitude
    const groundOpacity = Math.max(0, 1 - altitude / 180);
    ctx.globalAlpha = groundOpacity;
    ctx.fillStyle = "#14532d";

    ctx.fillRect(
        0,
        canvas.height - 45,
        canvas.width,
        45
    );

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(0, canvas.height - 45, canvas.width, 4);

    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(canvas.width / 2 - 34, canvas.height - 51, 68, 6);
    ctx.globalAlpha = 1;


    updateRocketPosition();
    drawRocket();
}


// ==========================================
// DESENHAR FOGUETE
// ==========================================

/* DESENHAR FOGUETE */

function updateRocketPosition() {
    if (!canvas) return;

    const groundLevel = canvas.height - 45;
    const altitudeScale = Math.max(1, canvas.height * 0.004);

    rocketX = canvas.width / 2 + horizontalDistance * altitudeScale;
    rocketY = groundLevel - altitude * altitudeScale;

    if (rocketX < 25) rocketX = canvas.width - 25;
    if (rocketX > canvas.width - 25) rocketX = 25;
}

function drawRocket() {
    if (!ctx) return;

    ctx.save();

    ctx.translate(
        rocketX,
        rocketY
    );

    ctx.rotate(
        (Number(angle ? angle.value : 90) - 90)
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


// ==========================================
// FÍSICA DO SIMULADOR
// ==========================================

function updateSimulation(dt) {

    if (!power || !mass || !angle) return;


    const powerValueNumber =
        Number(power.value);


    const rocketMass =
        Number(mass.value);


    const launchAngle =
        Number(angle.value);


    // Modelo educacional simplificado
    const motorForce =
        powerValueNumber * 2.5;


    const acceleration =
        motorForce / rocketMass;

    const angleRadians =
        launchAngle *
        Math.PI /
        180;

    const verticalAcceleration =
        acceleration * Math.sin(angleRadians) - gravity;
    const horizontalAcceleration =
        -acceleration * Math.cos(angleRadians);

    verticalVelocity += verticalAcceleration * dt;
    horizontalVelocity += horizontalAcceleration * dt;

    altitude += verticalVelocity * dt;
    horizontalDistance += horizontalVelocity * dt;
    velocity = Math.sqrt(
        verticalVelocity ** 2 + horizontalVelocity ** 2
    );


    // Tempo
    simulationTime += dt;


    // Limite inferior
    if (altitude < 0) {

        altitude = 0;
        velocity = 0;
        verticalVelocity = 0;
        horizontalVelocity = 0;
        horizontalDistance = 0;

    }


    updateDataPanel();

    drawScene();
}


// ==========================================
// LOOP DA ANIMAÇÃO
// ==========================================

function animate(timestamp) {

    if (!running) return;


    if (!lastTime) {
        lastTime = timestamp;
    }


    const dt =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );


    lastTime = timestamp;


    updateSimulation(dt);


    // Para quando retornar ao solo
    if (
        simulationTime > 0.5 &&
        velocity <= 0 &&
        altitude <= 0
    ) {

        running = false;

    }


    if (running) {
        requestAnimationFrame(animate);
    }
}


// ==========================================
// LANÇAR
// ==========================================

if (launchButton) {

    launchButton.addEventListener(
        "click",
        () => {

            if (running) return;


            // Reinicia os dados
            altitude = 0;
            velocity = 0;
            simulationTime = 0;
            horizontalDistance = 0;
            verticalVelocity = 0;
            horizontalVelocity = 0;


            running = true;

            lastTime = 0;


            updateDataPanel();

            requestAnimationFrame(animate);

        }
    );

}


// ==========================================
// RESETAR
// ==========================================

if (resetButton) {

    resetButton.addEventListener(
        "click",
        () => {

            running = false;

            altitude = 0;
            velocity = 0;
            simulationTime = 0;
            horizontalDistance = 0;
            verticalVelocity = 0;
            horizontalVelocity = 0;

            lastTime = 0;

            updateDataPanel();

            drawScene();

        }
    );

}


// ==========================================
// STUDY CARDS
// ==========================================

const studyContent = {

    fisica: {

        title: "⚛️ Física",

        description:
            "A Física permite compreender as forças e os movimentos envolvidos no lançamento de um foguete.",

        topics: [
            "Força e movimento",
            "Leis de Newton",
            "Gravidade",
            "Aceleração",
            "Velocidade"
        ],

        formula: "F = m × a"

    },


    programacao: {

        title: "💻 Programação",

        description:
            "A programação permite criar simuladores, controlar sistemas e processar dados.",

        topics: [
            "HTML",
            "CSS",
            "JavaScript",
            "Algoritmos",
            "Lógica de programação"
        ],

        formula: "if (launch) { start(); }"

    },


    robotica: {

        title: "🤖 Robótica",

        description:
            "A robótica combina programação, eletrônica e mecânica para criar sistemas automatizados.",

        topics: [
            "Arduino",
            "Sensores",
            "Motores",
            "Microcontroladores",
            "Automação"
        ],

        formula: "Sensor → Controlador → Atuador"

    },


    propulsao: {

        title: "🔥 Propulsão",

        description:
            "A propulsão está relacionada à geração de empuxo capaz de movimentar um veículo.",

        topics: [
            "Empuxo",
            "Força",
            "Massa",
            "Aceleração",
            "Conservação do momento"
        ],

        formula: "Empuxo → Movimento"

    },


    aerodinamica: {

        title: "🌬️ Aerodinâmica",

        description:
            "A aerodinâmica estuda como o ar interage com objetos em movimento.",

        topics: [
            "Arrasto",
            "Sustentação",
            "Resistência do ar",
            "Formato do foguete",
            "Estabilidade"
        ],

        formula: "Forças aerodinâmicas → Movimento"

    },


    astronomia: {

        title: "🛰️ Astronomia",

        description:
            "A Astronomia estuda corpos celestes, movimentos e fenômenos do universo.",

        topics: [
            "Planetas",
            "Estrelas",
            "Satélites",
            "Órbitas",
            "Sistema Solar"
        ],

        formula: "Órbita = velocidade + gravidade"

    },


    matematica: {

        title: "📐 Matemática",

        description:
            "A Matemática permite calcular grandezas importantes para analisar trajetórias.",

        topics: [
            "Velocidade",
            "Distância",
            "Tempo",
            "Ângulos",
            "Gráficos"
        ],

        formula: "v = Δs / Δt"

    },


    engenharia: {

        title: "🛠️ Engenharia",

        description:
            "A Engenharia utiliza ciência e tecnologia para desenvolver e testar sistemas.",

        topics: [
            "Projeto",
            "Modelagem",
            "Testes",
            "Materiais",
            "Sistemas"
        ],

        formula: "Projeto → Teste → Análise"

    }

};


// ==========================================
// ABRIR ESTUDO
// ==========================================

function openStudy(type) {

    const data = studyContent[type];

    if (!data) return;


    const oldArea =
        document.getElementById("studyArea");


    if (oldArea) {
        oldArea.remove();
    }


    const area =
        document.createElement("section");


    area.id = "studyArea";

    area.className = "study-area active";


    area.innerHTML = `

        <div class="study-container">

            <button class="close-study">
                ✕
            </button>

            <p class="tag">
                📚 ÁREA DE ESTUDO
            </p>

            <h2>
                ${data.title}
            </h2>

            <p class="study-description">
                ${data.description}
            </p>

            <div class="study-topics">

                ${data.topics.map(topic => `
                    <div class="study-topic">
                        ✓ ${topic}
                    </div>
                `).join("")}

            </div>

            <div class="study-formula">
                ${data.formula}
            </div>

        </div>
    `;


    const subjects =
        document.querySelector(".subjects");


    if (subjects) {

        subjects.after(area);

        area.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    const closeButton =
        area.querySelector(".close-study");


    closeButton.addEventListener(
        "click",
        () => {

            area.remove();

        }
    );

}


// ==========================================
// LIGAR OS 8 BOTÕES
// ==========================================

const studyButtons = {
    fisicaButton: "fisica",
    programacaoButton: "programacao",
    roboticaButton: "robotica"
};


Object.entries(studyButtons).forEach(
    ([buttonId, type]) => {

        const button =
            document.getElementById(buttonId);


        if (button) {

            button.addEventListener(
                "click",
                () => openStudy(type)
            );

        }

    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

updateSliderValues();

updateDataPanel();

resizeCanvas();
