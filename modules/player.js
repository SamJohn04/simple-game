import { seeds } from "./seed.js";

export const player = {
    x: 16,
    y: 16,
    width: 64,
    height: 64,
    reset() {
        this.x = 16;
        this.y = canvas.height / 2;
    },
    moveUp() {
        if (this.y > 16) {
            this.y -= 16;
        }
    },
    moveDown() {
        if (this.y < canvas.height - 70) {
            this.y += 16;
        }
    },
    shoot() {
        seeds.addSeed(this.x, this.y + 32);
    },
};
