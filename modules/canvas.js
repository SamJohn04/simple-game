import { restartGame, playerTakesDamage, enemyTakesDamage } from "./scene.js";

const movementOffsetX = 20;
const maximumBoundX = 1138;
const scorePosition = { x: 16, y: 50 };

let gameState = {};

export function playGame(assets, canvas, context) {
    gameState = restartGame();
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
    e.preventDefault();
    if (e.code === "ArrowUp") {
        gameState.player.moveUp();
    } else if (e.code === "ArrowDown") {
        gameState.player.moveDown();
    } else if (e.code === "ArrowRight") {
        gameState.player.shoot();
    }
});

function update(deltaTime, gameState, canvas) {
    gameState.offsetX -= movementOffsetX * deltaTime;
    if (gameState.offsetX <= -maximumBoundX) {
        gameState.offsetX = 0;
    }

    const enemyPosition = Math.floor(Math.random() * 8) * canvas.height / 8 + 10;
    if (gameState.score < 10 && gameState.enemies.enemies.length === 0) {
        gameState.enemies.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            width: 64,
            height: 64,
            speed: 100,
        });
    } else if (gameState.score >= 10 && gameState.enemies.enemies.length === 0) {
        gameState.enemies.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            width: 64,
            height: 64,
            speed: 120,
        });
    } else if (gameState.score >= 10 &&
        gameState.enemies.enemies[gameState.enemies.enemies.length - 1].x < canvas.width - 100) {
        gameState.enemies.enemies.push({
            x: canvas.width,
            y: enemyPosition,
            width: 64,
            height: 64,
            speed: 120,
        });
    }

    gameState.seeds.seeds.forEach((seed, i, seeds) => {
        seeds[i].x += seed.speed * deltaTime;
    })
    gameState.seeds.seeds = gameState.seeds.seeds.filter(seed => seed.x < canvas.width);

    gameState.enemies.enemies.forEach((enemy, i, enemies) => {
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
        if (enemies[i].x < 2-enemy.width) {
            gameState.score -= 1;
        }
    })
    gameState.enemies.enemies = gameState.enemies.enemies.filter(enemy => enemy.x >= 2-enemy.width);

    const toDelete = [];
    gameState.seeds.seeds.forEach((seed, i) => {
        gameState.enemies.enemies.forEach((enemy, j) => {
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
    gameState.seeds.seeds = gameState.seeds.seeds.filter((_, i) => !toDelete.some((val) => i === val[0]));
    gameState.enemies.enemies = gameState.enemies.enemies.filter((_, i) => !toDelete.some((val) => i === val[1]));

    if (gameState.score < 0) {
        gameState.isGameOver = true;
    }
}

function draw(assets, gameState, canvas, context) {
    context.font = "50px Bitcount, system-ui";
    context.fillStyle = "black";

    // Background
    context.drawImage(
        assets.sky,
        gameState.offsetX,
        0,
        maximumBoundX,
        canvas.height
    );
    context.drawImage(
        assets.sky,
        gameState.offsetX + maximumBoundX,
        0,
        maximumBoundX,
        canvas.height,
    );

    // Score
    context.fillText(
        gameState.score.toString(),
        scorePosition.x,
        scorePosition.y,
    );

    // Enemies
    gameState.enemies.enemies.forEach(enemy => {
        context.drawImage(
            assets.enemy,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
        );
    });

    // Seeds
    gameState.seeds.seeds.forEach(seed => {
        context.drawImage(
            assets.seed,
            seed.x,
            seed.y,
            seed.width,
            seed.height,
        )
    });

    // Player
    context.drawImage(
        assets.player,
        gameState.player.x,
        gameState.player.y,
        gameState.player.width,
        gameState.player.height,
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
        scorePosition.x,
        scorePosition.y,
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

    return { canvas: canvas, context };
}

