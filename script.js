const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game State --- //
let score = 0;
let lives = 3;
let gameOver = false;

// --- Game Objects --- //

// Player (Shisa)
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: 'orange',
    speed: 8,
    dx: 0
};

// Player Projectile
const projectile = {
    x: 0,
    y: 0,
    width: 5,
    height: 15,
    color: 'yellow',
    speed: 10,
    active: false // A projectile is only on screen when active
};

// Enemy Projectiles
const enemyProjectiles = [];
const enemyProjectileInfo = {
    width: 5,
    height: 15,
    color: 'red',
    speed: 5
};

// UFO
const ufo = {
    x: 0,
    y: 30,
    width: 60,
    height: 25,
    color: 'magenta',
    speed: 3,
    active: false,
    points: 100
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
    height: 30,
    color: 'lightgreen',
    padding: 15,
    rowCount: 3,
    colCount: 8,
    speed: 2
};

const enemies = [];

function createEnemies() {
    enemies.length = 0; // Clear existing enemies
    for (let c = 0; c < enemyInfo.colCount; c++) {
        for (let r = 0; r < enemyInfo.rowCount; r++) {
            enemies.push({
                x: c * (enemyInfo.width + enemyInfo.padding) + 60,
                y: r * (enemyInfo.height + enemyInfo.padding) + 50,
                width: enemyInfo.width,
                height: enemyInfo.height,
                color: enemyInfo.color,
                dx: enemyInfo.speed
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

    // Find bottom-most enemies
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

    // Pick a random enemy from the bottom row to shoot
    const shootingEnemy = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];

    enemyProjectiles.push({
        x: shootingEnemy.x + shootingEnemy.width / 2 - enemyProjectileInfo.width / 2,
        y: shootingEnemy.y + shootingEnemy.height,
        width: enemyProjectileInfo.width,
        height: enemyProjectileInfo.height,
        color: enemyProjectileInfo.color,
        speed: enemyProjectileInfo.speed
    });
}

const enemyShootingInterval = setInterval(enemyShoot, 2000); // Every 2 seconds


// --- UFO Activation --- //
function activateUfo() {
    if (!ufo.active) {
        ufo.active = true;
        // Start from left or right
        if (Math.random() > 0.5) {
            ufo.x = -ufo.width;
            ufo.speed = Math.abs(ufo.speed);
        } else {
            ufo.x = canvas.width;
            ufo.speed = -Math.abs(ufo.speed);
        }
    }
}
// Activate UFO periodically
const ufoInterval = setInterval(activateUfo, 15000); // Every 15 seconds


// --- Drawing --- //

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawProjectile() {
    if (projectile.active) {
        ctx.fillStyle = projectile.color;
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
}

function drawEnemyProjectiles() {
    enemyProjectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function drawBarriers() {
    barriers.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.health / barrierInfo.health; // Fade as it gets damaged
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    ctx.globalAlpha = 1.0; // Reset alpha
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawUfo() {
    if (ufo.active) {
        ctx.fillStyle = ufo.color;
        ctx.fillRect(ufo.x, ufo.y, ufo.width, ufo.height);
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
    ctx.textAlign = 'left'; // Reset alignment
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// --- Movement and Updates --- //

function movePlayer() {
    player.x += player.dx;

    // Wall detection
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function moveProjectile() {
    if (projectile.active) {
        projectile.y -= projectile.speed;
        if (projectile.y < 0) {
            projectile.active = false;
        }
    }
}

function moveEnemyProjectiles() {
    enemyProjectiles.forEach((p, index) => {
        p.y += p.speed;
        if (p.y > canvas.height) {
            enemyProjectiles.splice(index, 1);
        }
    });
}

function moveEnemies() {
    let moveDown = false;
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            moveDown = true;
        }
    });

    if (moveDown) {
        enemies.forEach(enemy => {
            enemy.dx *= -1;
            enemy.y += enemy.height;
        });
    }
}

function moveUfo() {
    if (ufo.active) {
        ufo.x += ufo.speed;
        // Deactivate if it goes off screen
        if (ufo.speed > 0 && ufo.x > canvas.width) {
            ufo.active = false;
        }
        if (ufo.speed < 0 && ufo.x + ufo.width < 0) {
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
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                projectile.active = false;
                enemies.splice(index, 1);
                score += 10;
            }
        });

        // vs UFO
        if (
            ufo.active &&
            projectile.x < ufo.x + ufo.width &&
            projectile.x + projectile.width > ufo.x &&
            projectile.y < ufo.y + ufo.height &&
            projectile.y + projectile.height > ufo.y
        ) {
            projectile.active = false;
            ufo.active = false;
            score += ufo.points;
        }

        // vs Barriers
        barriers.forEach((b, index) => {
            if (
                projectile.x < b.x + b.width &&
                projectile.x + projectile.width > b.x &&
                projectile.y < b.y + b.height &&
                projectile.y + projectile.height > b.y
            ) {
                projectile.active = false;
                b.health--;
                if (b.health <= 0) {
                    barriers.splice(index, 1);
                }
            }
        });
    }

    // Enemy projectile collisions
    enemyProjectiles.forEach((p, pIndex) => {
        // vs Player
        if (
            p.x < player.x + player.width &&
            p.x + p.width > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height > player.y
        ) {
            enemyProjectiles.splice(pIndex, 1);
            lives--;
            player.color = 'red';
            setTimeout(() => { player.color = 'orange'; }, 200);
            return; // Exit after one hit per frame
        }

        // vs Barriers
        barriers.forEach((b, bIndex) => {
            if (
                p.x < b.x + b.width &&
                p.x + p.width > b.x &&
                p.y < b.y + b.height &&
                p.y + p.height > b.y
            ) {
                enemyProjectiles.splice(pIndex, 1);
                b.health--;
                if (b.health <= 0) {
                    barriers.splice(bIndex, 1);
                }
                return; // Exit after one hit per frame
            }
        });
    });
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
    createEnemies();
    createBarriers();
    // Reset player position
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    // Clear projectiles
    projectile.active = false;
    enemyProjectiles.length = 0;
    // Hide UFO
    ufo.active = false;
    update();
}


// --- Keyboard Input --- //

function shoot() {
    if (!projectile.active) {
        projectile.active = true;
        projectile.x = player.x + player.width / 2 - projectile.width / 2;
        projectile.y = player.y;
    }
}

function keyDown(e) {
    if (gameOver && e.key === 'Enter') {
        restartGame();
        return;
    }

    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.code === 'Space') {
        shoot();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Start the game
update();