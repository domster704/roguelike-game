function range(rangeMin, rangeMax, count) {
    let nums = new Set();
    while (nums.size < count) {
        nums.add(Math.round(Math.random() * (rangeMax - 1 - rangeMin) + rangeMin));
    }
    return [...nums];
}

class Game {
    constructor() {
    }

    init() {
        let map = new Map();
        map.createMap();
    }
}

const game = new Game();
game.init();