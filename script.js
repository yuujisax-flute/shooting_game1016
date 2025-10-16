const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game State --- //
let score = 0;
let lives = 3;
let gameOver = false;
let playerHit = false;

// --- Game Objects --- //

// Player (Shisa)
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    emoji: '🦁',
    speed: 8,
    dx: 0,
    fontSize: '48px'
};

// Player Projectile
const projectile = {
    x: 0,
    y: 0,
    width: 30, // Adjusted for emoji
    height: 30,
    emoji: '🔥',
    speed: 10,
    active: false,
    fontSize: '28px'
};

// Enemy Projectiles
const enemyProjectiles = [];
const enemyProjectileInfo = {
    width: 30,
    height: 30,
    emoji: '💧', // Water drop to counter fire
    speed: 5,
    fontSize: '28px'
};

// UFO
const ufo = {
    x: 0,
    y: 55, // Adjusted y-pos for emoji rendering
    width: 60,
    height: 40,
    emoji: '🛸',
    speed: 3,
    active: false,
    points: 100,
    fontSize: '40px'
};

// Barriers
const barriers = [];
const barrierInfo = {
    rows: 4,
    cols: 12,
    partSize: 8,
    y: canvas.height - 150,
    health: 3
};

// Enemies
const enemyInfo = {
    width: 50,
    height: 50,
    emoji: '👹',
    padding: 15,
    rowCount: 3,
    colCount: 8,
    speed: 2,
    fontSize: '42px'
};

const enemies = [];

function createEnemies() {
    enemies.length = 0; // Clear existing enemies
    for (let c = 0; c < enemyInfo.colCount; c++) {
        for (let r = 0; r < enemyInfo.rowCount; r++) {
            enemies.push({
                x: c * (enemyInfo.width + enemyInfo.padding) + 60,
                y: r * (enemyInfo.height + enemyInfo.padding) + 70, // Adjust y for emoji rendering
                width: enemyInfo.width,
                height: enemyInfo.height,
                emoji: enemyInfo.emoji,
                dx: enemyInfo.speed,
                fontSize: enemyInfo.fontSize
            });
        }
    }
}

function createBarriers() {
    barriers.length = 0;
    const barrierCount = 2;
    const totalBarrierWidth = barrierInfo.cols * barrierInfo.partSize;
    const spacing = (canvas.width - (barrierCount * totalBarrierWidth)) / (barrierCount + 1);

    for (let i = 0; i < barrierCount; i++) {
        const startX = spacing * (i + 1) + totalBarrierWidth * i;
        for (let r = 0; r < barrierInfo.rows; r++) {
            for (let c = 0; c < barrierInfo.cols; c++) {
                barriers.push({
                    x: startX + c * barrierInfo.partSize,
                    y: barrierInfo.y + r * barrierInfo.partSize,
                    width: barrierInfo.partSize,
                    height: barrierInfo.partSize,
                    health: barrierInfo.health,
                    color: '#55aa55'
                });
            }
        }
    }
}

createEnemies();
createBarriers();

// --- Firing Mechanisms --- //
function enemyShoot() {
    if (gameOver || enemies.length === 0) return;

    const bottomEnemies = [];
    for (let c = 0; c < enemyInfo.colCount; c++) {
        const columnEnemies = enemies.filter(e => 
            e.x > c * (enemyInfo.width + enemyInfo.padding) + 60 - 5 &&
            e.x < c * (enemyInfo.width + enemyInfo.padding) + 60 + 5
        );
        if (columnEnemies.length > 0) {
            bottomEnemies.push(columnEnemies.sort((a, b) => b.y - a.y)[0]);
        }
    }

    if (bottomEnemies.length === 0) return;

    const shootingEnemy = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];

    enemyProjectiles.push({
        x: shootingEnemy.x + shootingEnemy.width / 2 - enemyProjectileInfo.width / 2,
        y: shootingEnemy.y,
        ...enemyProjectileInfo
    });
}

const enemyShootingInterval = setInterval(enemyShoot, 2000);

// --- UFO Activation --- //
function activateUfo() {
    if (!ufo.active) {
        ufo.active = true;
        if (Math.random() > 0.5) {
            ufo.x = -ufo.width;
            ufo.speed = Math.abs(ufo.speed);
        } else {
            ufo.x = canvas.width;
            ufo.speed = -Math.abs(ufo.speed);
        }
    }
}
const ufoInterval = setInterval(activateUfo, 15000);

// --- Drawing --- //

function drawPlayer() {
    if (playerHit) {
        ctx.font = player.fontSize;
        ctx.fillText('💥', player.x, player.y);
    } else {
        ctx.font = player.fontSize;
        ctx.fillText(player.emoji, player.x, player.y);
    }
}

function drawProjectile() {
    if (projectile.active) {
        ctx.font = projectile.fontSize;
        ctx.fillText(projectile.emoji, projectile.x, projectile.y);
    }
}

function drawEnemyProjectiles() {
    enemyProjectiles.forEach(p => {
        ctx.font = p.fontSize;
        ctx.fillText(p.emoji, p.x, p.y);
    });
}

function drawBarriers() {
    barriers.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.health / barrierInfo.health;
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    ctx.globalAlpha = 1.0;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.font = enemy.fontSize;
        ctx.fillText(enemy.emoji, enemy.x, enemy.y);
    });
}

function drawUfo() {
    if (ufo.active) {
        ctx.font = ufo.fontSize;
        ctx.fillText(ufo.emoji, ufo.x, ufo.y);
    }
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 10, 25);
}

function drawLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 80, 25);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '60px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 50);
    ctx.textAlign = 'left';
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Movement and Updates --- //

function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function moveProjectile() {
    if (projectile.active) {
        projectile.y -= projectile.speed;
        if (projectile.y < 0) projectile.active = false;
    }
}

function moveEnemyProjectiles() {
    enemyProjectiles.forEach((p, index) => {
        p.y += p.speed;
        if (p.y > canvas.height) enemyProjectiles.splice(index, 1);
    });
}

function moveEnemies() {
    let moveDown = false;
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) moveDown = true;
    });

    if (moveDown) {
        enemies.forEach(enemy => {
            enemy.dx *= -1;
            enemy.y += enemy.height / 2; // Move down less steeply
        });
    }
}

function moveUfo() {
    if (ufo.active) {
        ufo.x += ufo.speed;
        if ((ufo.speed > 0 && ufo.x > canvas.width) || (ufo.speed < 0 && ufo.x + ufo.width < 0)) {
            ufo.active = false;
        }
    }
}

// --- Collision Detection --- //
function checkCollisions() {
    // Player projectile collisions
    if (projectile.active) {
        // vs Enemies
        enemies.forEach((enemy, index) => {
            if (isColliding(projectile, enemy)) {
                projectile.active = false;
                enemies.splice(index, 1);
                score += 10;
            }
        });

        // vs UFO
        if (ufo.active && isColliding(projectile, ufo)) {
            projectile.active = false;
            ufo.active = false;
            score += ufo.points;
        }

        // vs Barriers
        barriers.forEach((b, index) => {
            if (isColliding(projectile, b)) {
                projectile.active = false;
                b.health--;
                if (b.health <= 0) barriers.splice(index, 1);
            }
        });
    }

    // Enemy projectile collisions
    enemyProjectiles.forEach((p, pIndex) => {
        // vs Player
        if (isColliding(p, player)) {
            enemyProjectiles.splice(pIndex, 1);
            if (!playerHit) { // Prevent multiple hits in quick succession
                lives--;
                playerHit = true;
                setTimeout(() => { playerHit = false; }, 500);
            }
            return;
        }

        // vs Barriers
        barriers.forEach((b, bIndex) => {
            if (isColliding(p, b)) {
                enemyProjectiles.splice(pIndex, 1);
                b.health--;
                if (b.health <= 0) barriers.splice(bIndex, 1);
                return;
            }
        });
    });
}

function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// --- Main Game Loop --- //

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    clear();

    drawBarriers();
    drawPlayer();
    drawProjectile();
    drawEnemyProjectiles();
    drawEnemies();
    drawUfo();
    drawScore();
    drawLives();

    movePlayer();
    moveProjectile();
    moveEnemyProjectiles();
    moveEnemies();
    moveUfo();

    checkCollisions();

    if (lives <= 0) {
        gameOver = true;
    }

    requestAnimationFrame(update);
}

// --- Game Restart ---
function restartGame() {
    gameOver = false;
    lives = 3;
    score = 0;
    playerHit = false;
    createEnemies();
    createBarriers();
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    projectile.active = false;
    enemyProjectiles.length = 0;
    ufo.active = false;
    update();
}

// --- Keyboard Input --- //

function shoot() {
    if (!projectile.active) {
        projectile.active = true;
        projectile.x = player.x + player.width / 2 - projectile.width / 2;
        projectile.y = player.y - player.height / 2;
    }
}

function keyDown(e) {
    if (gameOver && e.key === 'Enter') {
        restartGame();
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') player.dx = player.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'Left') player.dx = -player.speed;
    else if (e.code === 'Space') shoot();
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Start the game
update();