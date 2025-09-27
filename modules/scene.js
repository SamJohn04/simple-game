import { player } from "./player.js";
import { seeds } from "./seed.js";
import { enemies } from "./enemy.js";

export function restartGame() {
    player.reset();
    seeds.reset();
    enemies.reset();
    return {
        player,
        seeds,
        enemies,
        offsetX: 0,
        score: 0,
        isGameOver: false,
    };
}

export function playerTakesDamage(playerX, playerY, enemyX, enemyY) {
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

export function enemyTakesDamage(seedX, seedY, enemyX, enemyY) {
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


