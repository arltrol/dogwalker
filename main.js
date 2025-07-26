<canvas id="gameCanvas"></canvas>
<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Load the sprite sheet
const sprite = new Image();
sprite.src = 'sprite_sheet_2x4_384x192.png';

// Sprite layout: 2x4 grid, each cell 384×192
const SPRITES = {
  background: [0, 0, 384, 192],
  walker:     [384, 0, 384, 192],
  cyclist:    [0, 192, 384, 192],
  puddle:     [384, 192, 384, 192],
  bone:       [0, 384, 384, 192],
  heart:      [384, 384, 384, 192],
  paw:        [0, 576, 384, 192]
};

// Scaling constants
const SCALE = 0.25;
const SPRITE_W = 384 * SCALE; // = 96
const SPRITE_H = 192 * SCALE; // = 48

let playerY = H / 2;
let score = 0;
let lives = 3;
let bones = [];
let obstacles = [];
let gameSpeed = 4;

function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function drawSprite([sx, sy, sw, sh], dx, dy, dw, dh) {
  ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
}

function spawnBone() {
  bones.push({ x: W + 50, y: Math.random() * (H - SPRITE_H) });
}

function spawnObstacle() {
  const isCyclist = Math.random() > 0.5;
  obstacles.push({
    x: W + 50,
    y: Math.random() * (H - SPRITE_H),
    type: isCyclist ? 'cyclist' : 'puddle'
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(SPRITES.background, 0, 0, W, H);

  // Clamp and draw player
  playerY = Math.max(0, Math.min(H - SPRITE_H, playerY));
  drawSprite(SPRITES.walker, 100, playerY, SPRITE_W, SPRITE_H);

  bones.forEach((b, i) => {
    b.x -= gameSpeed;
    drawSprite(SPRITES.bone, b.x, b.y, SPRITE_W * 0.8, SPRITE_H * 0.8);
    if (b.x < -50) bones.splice(i, 1);
    else if (Math.abs(b.x - 100) < SPRITE_W && Math.abs(b.y - playerY) < SPRITE_H) {
      score++;
      beep();
      bones.splice(i, 1);
    }
  });

  obstacles.forEach((o, i) => {
    o.x -= gameSpeed;
    const spriteRef = o.type === 'cyclist' ? SPRITES.cyclist : SPRITES.puddle;
    drawSprite(spriteRef, o.x, o.y, SPRITE_W, SPRITE_H);
    if (o.x < -50) obstacles.splice(i, 1);
    else if (Math.abs(o.x - 100) < SPRITE_W && Math.abs(o.y - playerY) < SPRITE_H) {
      lives--;
      beep();
      obstacles.splice(i, 1);
    }
  });

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

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') playerY -= 40;
  if (e.key === 'ArrowDown') playerY += 40;
});

canvas.addEventListener('touchstart', (e) => {
  const touchY = e.touches[0].clientY;
  playerY = touchY - SPRITE_H / 2;
});

setInterval(spawnBone, 2000);
setInterval(spawnObstacle, 3000);

sprite.onload = () => gameLoop();
</script>
