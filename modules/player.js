export const player = {
    x: 16,
    y: 16,
};

export let seeds = [];

export function resetPlayer(canvas) {
    player.x = 16;
    player.y = canvas.height / 2;
}

export function resetSeeds() {
    seeds = [];
}

