function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

export async function loadAssets() {
    const [player, sky, seed, enemy] = await Promise.all([
        loadImage("assets/player.png"),
        loadImage("assets/sky.png"),
        loadImage("assets/seed.png"),
        loadImage("assets/enemy.png"),
    ]);
    return { player, sky, seed, enemy };
}
