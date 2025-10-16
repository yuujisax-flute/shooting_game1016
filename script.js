const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

// Projectile
const projectile = {
    x: 0,
    y: 0,
    width: 5,
    height: 15,
    color: 'yellow',
    speed: 10,
    active: false // A projectile is only on screen when active
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

createEnemies();


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

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
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

// --- Collision Detection --- //
function checkCollisions() {
    // Projectile and enemies
    if (projectile.active) {
        enemies.forEach((enemy, index) => {
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                // Collision detected
                projectile.active = false;
                enemies.splice(index, 1);
            }
        });
    }
}


// --- Main Game Loop --- //

function update() {
    clear();

    drawPlayer();
    drawProjectile();
    drawEnemies();

    movePlayer();
    moveProjectile();
    moveEnemies();

    checkCollisions();

    requestAnimationFrame(update);
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