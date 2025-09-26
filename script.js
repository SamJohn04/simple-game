function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

async function loadAssets() {
    const [player, sky, seed] = await Promise.all([
        loadImage("assets/player.png"),
        loadImage("assets/sky.png"),
        loadImage("assets/seed.png"),
    ]);
    return { player, sky, seed };
}

const canvas = document.getElementById("canvas");
const context = canvas?.getContext("2d");

let previousTimestamp = 0;

loadAssets().then((assets) => gameLoop(assets, 0));

function gameLoop(assets, timestamp) {
    const deltaTime = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp;
    update(deltaTime);
    draw(assets);
    if (!gameState.isGameOver) {
        requestAnimationFrame((timestamp) => gameLoop(assets, timestamp));
    } else {
        drawGameOver();
    }
}

function update(_deltaTime) {
    gameState.offsetX -= 0.2;
    if (gameState.offsetX <= -1138) {
        gameState.offsetX = 0;
    }

    const enemyPosition = Math.floor(Math.random() * 8) * canvas.height / 8 + 10;
    if (gameState.score < 10 && gameState.enemies.length === 0) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 0.5,
        })
    } else if (gameState.score >= 10 && gameState.enemies.length === 0) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 0.6,
        })
    } else if (gameState.score >= 10 &&
        gameState.enemies[gameState.enemies.length - 1].x < canvas.width - 100) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 0.6,
        })
    }

    gameState.seeds.forEach((seed, i, seeds) => {
        seeds[i].x += seed.speed;
    })
    gameState.seeds = gameState.seeds.filter(seed => seed.x < canvas.width);

    gameState.enemies.forEach((enemy, i, enemies) => {
        enemies[i].x -= enemy.speed;
        if (playerTakesDamage(
            gameState.player.x,
            gameState.player.y,
            enemies[i].x,
            enemies[i].y,
        )) {
            gameState.isGameOver = true;
            return;
        }
        if (enemies[i].x < -62) {
            gameState.score -= 1;
        }
    })
    gameState.enemies = gameState.enemies.filter(enemy => enemy.x >= -62);

    const toDelete = [];
    gameState.seeds.forEach((seed, i) => {
        gameState.enemies.forEach((enemy, j) => {
            if (enemyTakesDamage(
                seed.x,
                seed.y,
                enemy.x,
                enemy.y,
            )) {
                toDelete.push([i, j]);
                gameState.score++;
            }
        })
    })
    gameState.seeds = gameState.seeds.filter((_, i) => !toDelete.some((val) => i === val[0]));
    gameState.enemies = gameState.enemies.filter((_, i) => !toDelete.some((val) => i === val[1]));

    if (gameState.score < 0) {
        gameState.isGameOver = true;
    }
}

function draw(assets) {
    context.font = "50px Bitcount, system-ui";
    context.fillStyle = "black";

    context.drawImage(
        assets.sky,
        gameState.offsetX,
        0,
        1138,
        canvas.height
    );
    context.drawImage(
        assets.sky,
        gameState.offsetX + 1138,
        0,
        1138,
        canvas.height,
    );
    context.fillText(
        gameState.score.toString(),
        16,
        50,
    );

    context.fillStyle = "red";
    gameState.enemies.forEach(enemy => {
        context.fillRect(
            enemy.x,
            enemy.y,
            64,
            64
        );
    });

    gameState.seeds.forEach(seed => {
        context.drawImage(
            assets.seed,
            seed.x,
            seed.y,
            16,
            16
        )
    });

    context.drawImage(
        assets.player,
        gameState.player.x,
        gameState.player.y,
        64,
        64,
    );
}

function drawGameOver() {
    const gameOverText = "Game Over";

    context.fillStyle = "gray";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.font = "50px Bitcount, system-ui";

    context.fillText(
        gameState.score.toString(),
        16,
        50
    );

    context.font = "50px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
        gameOverText,
        canvas.width / 2,
        canvas.height / 2,
    );
}

const gameState = {
    player: {
        x: 16,
        y: canvas.height / 2,
    },
    enemies: [],
    seeds: [],
    offsetX: 0,
    score: 0,
    isGameOver: false,
};

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" && gameState.player.y > 16) {
        gameState.player.y -= 16;
    } else if (e.code === "ArrowDown"
        && gameState.player.y < canvas.height - 70) {
        gameState.player.y += 16;
    } else if (e.code === "ArrowRight") {
        gameState.seeds.push({
            x: 80,
            y: gameState.player.y + 32,
            speed: 2
        });
    }
});


function playerTakesDamage(playerX, playerY, enemyX, enemyY) {
    if (playerX + 16 > enemyX + 64) {
        return false;
    }
    if (playerX + 48 < enemyX) {
        return false;
    }
    if (playerY + 16 > enemyY + 64) {
        return false;
    }
    if (playerY + 48 < enemyY) {
        return false;
    }
    return true;
}

function enemyTakesDamage(seedX, seedY, enemyX, enemyY) {
    if (seedX > enemyX + 56) {
        return false;
    }
    if (seedX + 16 < enemyX + 8) {
        return false;
    }
    if (seedY > enemyY + 56) {
        return false;
    }
    if (seedY + 16 < enemyY + 8) {
        return false;
    }
    return true;
}

