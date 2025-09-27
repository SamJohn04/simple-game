import { restartGame, playerTakesDamage, enemyTakesDamage } from "./scene.js";

let gameState = {};

export function playGame(assets, canvas, context) {
    gameState = restartGame(canvas);
    let previousTimestamp = 0;

    function gameLoop(timestamp) {
        const deltaTime = (timestamp - previousTimestamp) / 1000;
        previousTimestamp = timestamp;
        update(deltaTime, gameState, canvas);
        draw(assets, gameState, canvas, context);
        if (gameState.isGameOver) {
            drawGameOver(gameState, canvas, context);
        } else {
            requestAnimationFrame(gameLoop);
        }
    }
    gameLoop(0);
}

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
            speed: 250
        });
    }
});

function update(deltaTime, gameState, canvas) {
    gameState.offsetX -= 20 * deltaTime;
    if (gameState.offsetX <= -1138) {
        gameState.offsetX = 0;
    }

    const enemyPosition = Math.floor(Math.random() * 8) * canvas.height / 8 + 10;
    if (gameState.score < 10 && gameState.enemies.length === 0) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 100,
        });
    } else if (gameState.score >= 10 && gameState.enemies.length === 0) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 120,
        });
    } else if (gameState.score >= 10 &&
        gameState.enemies[gameState.enemies.length - 1].x < canvas.width - 100) {
        gameState.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            speed: 120,
        });
    }

    gameState.seeds.forEach((seed, i, seeds) => {
        seeds[i].x += seed.speed * deltaTime;
    })
    gameState.seeds = gameState.seeds.filter(seed => seed.x < canvas.width);

    gameState.enemies.forEach((enemy, i, enemies) => {
        enemies[i].x -= enemy.speed * deltaTime;
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

function draw(assets, gameState, canvas, context) {
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

    gameState.enemies.forEach(enemy => {
        context.drawImage(
            assets.enemy,
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

function drawGameOver(gameState, canvas, context) {
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

export function getCanvasAndContext() {
    const canvas = document.getElementById("canvas");
    if (canvas === null || !(canvas instanceof HTMLCanvasElement)) {
        throw {
            name: "UndeclaredCanvasError",
            message: "a canvas element by id 'canvas' should be declared",
        };
    }

    const context = canvas.getContext("2d");
    if (context === null) {
        throw {
            name: "ContextNullError",
            message: "context returned null",
        }
    }

    return { canvas, context };
}

