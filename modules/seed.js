export const seeds = {
    seeds: [],
    reset() {
        this.seeds = [];
    },
    addSeed(x, y) {
        this.seeds.push({
            x,
            y,
            width: 16,
            height: 16,
            speed: 500
        });
    }
};
