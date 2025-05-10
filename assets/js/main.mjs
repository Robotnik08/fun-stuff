import { drawCircle, drawLine } from "./imports/canvas.mjs";
import { POINT_RADIUS } from "./imports/constants.mjs";

const canvas = document.getElementById("canvas");
const otherCanvas = document.getElementById("line_canvas");
const ctx = canvas.getContext("2d");
const otherCtx = otherCanvas.getContext("2d");
const currentSpeed = document.getElementById("current_speed");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
otherCanvas.width = window.innerWidth;
otherCanvas.height = window.innerHeight;
ctx.strokeStyle = "white";
ctx.fillStyle = "white";
otherCtx.strokeStyle = "white";
otherCtx.fillStyle = "white";

let active = false;
let refresh = true;
let hide_pendulum = false;
let hide_line = false;
let draw_circle = true;
let speed_multiplier = 1;

let tick = 0;
let dt = 0;
let lastTime = 0;


const points = [];
let lastPointPos = {x: -1, y: -1};
const center = {x: window.innerWidth / 2, y: window.innerHeight / 2};

canvas.addEventListener("mousedown", (e) => {
    if (active) {
        return;
    }
    const x = e.clientX;
    const y = e.clientY;

    points.push({ x, y });
});

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    switch (e.code) {
        case "Space":
            active = !active;
            if (tick > 0) {
                tick %= Math.PI * 2;
                tick -= Math.PI * 2;
            }
            break;
        case "KeyR":
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            otherCtx.clearRect(0, 0, otherCanvas.width, otherCanvas.height);
            points.length = 0;
            lastPointPos.x = -1;
            lastPointPos.y = -1;
            tick = 0;
            active = false;
            break;
        case "KeyC":
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            break;
        case "KeyP":
            hide_pendulum = !hide_pendulum;
            break;
        case "KeyL":
            hide_line = !hide_line;
            break;
        case "KeyX":
            refresh = !refresh;
            break;
        case "KeyO":
            draw_circle = !draw_circle;
            break;
        case "ArrowRight":
            speed_multiplier += 0.1;
            if (speed_multiplier > 3) speed_multiplier = 3;
            break;
        case "ArrowLeft":
            speed_multiplier -= 0.1;
            if (speed_multiplier < 0) speed_multiplier = 0;
            break;
    }
});

function update() {
    const now = Date.now();
    dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.1) dt = 0.1; // Clamp dt to avoid large jumps
    if (active) {
        tick += dt * speed_multiplier;
    }

    if (refresh) ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentSpeed.innerText = `${Math.round(speed_multiplier * 100) / 100}`;

    canvas.style.cursor = active ? "default" : "crosshair";
    canvas.style.display = hide_pendulum ? "none" : "block";
    otherCanvas.style.display = hide_line ? "none" : "block";

    for (let i = 0; i < points.length; i++) {
        if (i > 0) {
            const prevPoint = points[i - 1];
            const point = points[i];
            drawLine(ctx, prevPoint.x, prevPoint.y, point.x, point.y);
        } else {
            drawLine(ctx, center.x, center.y, points[i].x, points[i].y);
        }
        
        if (draw_circle) {
            const point = points[i];
            drawCircle(ctx, point.x, point.y, POINT_RADIUS);
        }
    }

    if (draw_circle) {
        ctx.fillStyle = "white";
        drawCircle(ctx, center.x, center.y, POINT_RADIUS);
    }

    if (active) {
        movePoints();
        // draw line from last point to old last point on the other canvas
        if (points.length > 0 && tick < Math.PI * 2 * 1.01) {
            if (lastPointPos.x != -1 && lastPointPos.y != -1) {
                drawLine(otherCtx, lastPointPos.x, lastPointPos.y, points[points.length - 1].x, points[points.length - 1].y);
            }
            lastPointPos.x = points[points.length - 1].x;
            lastPointPos.y = points[points.length - 1].y;
        }
    }

    requestAnimationFrame(update);
}

// Start the animation loop
update();


function movePoints() {
    for (let j = 0; j < points.length; j++) {
        const pivot = j == 0 ? center : points[j - 1];
        for (let i = j; i < points.length; i++) {
            const point = points[i];
            const angle = Math.atan2(point.y - pivot.y, point.x - pivot.x);
            const distance = Math.sqrt((point.x - pivot.x) ** 2 + (point.y - pivot.y) ** 2);
            const newX = pivot.x + distance * Math.cos(angle + speed_multiplier * dt);
            const newY = pivot.y + distance * Math.sin(angle + speed_multiplier * dt);
            point.x = newX;
            point.y = newY;
        }
    }
}