const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Load the sprite sheet
const sprite = new Image();
sprite.src = 'dog_walker_game_assets.png';

// Fixed sprite layout: 2 columns × 4 rows, each 384×384
const SPRITES = {
  background: [0, 0, 384, 384],
  walker:     [384, 0, 384, 384],
  cyclist:    [0, 384, 384, 384],
  puddle:     [384, 384, 384, 384],
  bone:       [0, 768, 384, 384],
  heart:      [384, 768, 384, 384],
  paw:        [0, 1152, 384, 384]
};

let playerY = H / 2;
let score = 0;
let lives = 3;
let bones = [];
let obstacles = [];
let gameSpeed = 4;

// Beep sound (simple oscillator)
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
  bones.push({ x: W + 50, y: Math.random() * (H - 60) });
}

function spawnObstacle() {
  const isCyclist = Math.random() > 0.5;
  obstacles.push({
    x: W + 50,
    y: Math.random() * (H - 60),
    type: isCyclist ? 'cyclist' : 'puddle'
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(SPRITES.background, 0, 0, W, H);

  // Clamp playerY within screen
  playerY = Math.max(0, Math.min(H - 64, playerY));

  // Draw player (walker)
  drawSprite(SPRITES.walker, 100, playerY, 64, 64);

  // Draw bones
  bones.forEach((b, i) => {
    b.x -= gameSpeed;
    drawSprite(SPRITES.bone, b.x, b.y, 40, 40);
    if (b.x < -50) bones.splice(i, 1);
    else if (Math.abs(b.x - 100) < 40 && Math.abs(b.y - playerY) < 40) {
      score++;
      beep();
      bones.splice(i, 1);
    }
  });

  // Draw obstacles
  obstacles.forEach((o, i) => {
    o.x -= gameSpeed;
    const spriteRef = o.type === 'cyclist' ? SPRITES.cyclist : SPRITES.puddle;
    drawSprite(spriteRef, o.x, o.y, 50, 50);
    if (o.x < -50) obstacles.splice(i, 1);
    else if (Math.abs(o.x - 100) < 40 && Math.abs(o.y - playerY) < 40) {
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

  // Game Over
  if (lives <= 0) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', W / 2 - 100, H / 2);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Keyboard Controls
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') playerY -= 40;
  if (e.key === 'ArrowDown') playerY += 40;
});

// Touch Controls (mobile)
canvas.addEventListener('touchstart', (e) => {
  const touchY = e.touches[0].clientY;
  playerY = touchY - 32;
});

// Spawn intervals
setInterval(spawnBone, 2000);
setInterval(spawnObstacle, 3000);

// Start game
sprite.onload = () => gameLoop();
