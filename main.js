const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Load the sprite sheet
const sprite = new Image();
sprite.src = 'dog_walker_game_assets.png'; // Host this on /assets/ or same dir

// Define sprite positions from 2x4 layout
const SPRITES = {
  background: [0, 0, 512, 512],
  walker: [512, 0, 256, 256],
  cyclist: [0, 512, 256, 256],
  puddle: [256, 512, 256, 256],
  bone: [0, 768, 256, 256],
  heart: [256, 768, 256, 256],
  paw: [0, 1024, 256, 256]
};

let playerY = H / 2;
let score = 0;
let lives = 3;
let bones = [];
let obstacles = [];
let gameSpeed = 4;

// Generate beep sounds
const beep = () => new AudioContext().createOscillator().start();

function drawSprite([sx, sy, sw, sh], dx, dy, dw, dh) {
  ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
}

function spawnBone() {
  bones.push({ x: W + 100, y: Math.random() * (H - 100) });
}

function spawnObstacle() {
  const isCyclist = Math.random() > 0.5;
  obstacles.push({
    x: W + 100,
    y: Math.random() * (H - 100),
    type: isCyclist ? 'cyclist' : 'puddle'
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(SPRITES.background, 0, 0, W, H);

  // Draw player
  drawSprite(SPRITES.walker, 100, playerY, 100, 100);

  // Bones
  bones.forEach((b, i) => {
    b.x -= gameSpeed;
    drawSprite(SPRITES.bone, b.x, b.y, 40, 40);
    if (b.x < 0) bones.splice(i, 1);
    else if (Math.abs(b.x - 100) < 40 && Math.abs(b.y - playerY) < 40) {
      score++;
      beep();
      bones.splice(i, 1);
    }
  });

  // Obstacles
  obstacles.forEach((o, i) => {
    o.x -= gameSpeed;
    const spriteRef = o.type === 'cyclist' ? SPRITES.cyclist : SPRITES.puddle;
    drawSprite(spriteRef, o.x, o.y, 60, 60);
    if (o.x < 0) obstacles.splice(i, 1);
    else if (Math.abs(o.x - 100) < 50 && Math.abs(o.y - playerY) < 50) {
      lives--;
      beep();
      obstacles.splice(i, 1);
    }
  });

  // HUD
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, 20, 60);

  if (lives <= 0) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', W / 2 - 100, H / 2);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Controls
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') playerY -= 40;
  if (e.key === 'ArrowDown') playerY += 40;
});

canvas.addEventListener('touchstart', (e) => {
  const touchY = e.touches[0].clientY;
  playerY = touchY - 50;
});

// Spawning
setInterval(spawnBone, 2000);
setInterval(spawnObstacle, 3000);

// Start
sprite.onload = () => gameLoop();
