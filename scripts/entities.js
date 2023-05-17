class Tile {
    width = 30;
    cssStyle = ""

    obj = null;

    constructor(x, y, cssStyleName, field) {
        this.positionX = x;
        this.positionY = y;
        this.cssStyle = cssStyleName;
        this.field = field;
    }

    getHTMLFormat() {
        return $('<div>').addClass(`${this.cssStyle}`).css({
            "margin-left": `${this.positionX * this.width}px`,
            "margin-top": `${this.positionY * this.width}px`,
        });
    }

    create() {
        this.field.append(this.getHTMLFormat());
    }
}

class WallCell extends Tile {
    constructor(x, y, field) {
        super(x, y, 'tile tileW', field);
        this.create();
    }
}

class VoidCell extends Tile {
    constructor(x, y, field) {
        super(x, y, 'tile', field);
        this.create();
    }
}

class Sword extends Tile {
    power = 5;

    constructor(x, y, field) {
        super(x, y, "tile tileSW", field);
        this.create();
    }
}

class Health extends Tile {
    hp = 20;

    constructor(x, y, field) {
        super(x, y, "tile tileHP", field);
        this.create();
    }
}

class Entity extends Tile {
    #power;
    #hp;

    status = "live";

    constructor(x, y, cssStyleName, field, map) {
        super(x, y, cssStyleName, field);
        this.map = map;
        this.setHp(100);
        this.setPower(20);
    }

    getHTMLFormat() {
        return $('<div>').addClass(`${this.cssStyle}`).css({
            "margin-left": `${this.positionX * this.width}px`,
            "margin-top": `${this.positionY * this.width}px`,
        }).append(new HP(0, 0, this.cssStyle, this.field, this.#hp).getHTMLFormat());
    }

    getPower() {
        return this.#power;
    }

    setPower(value) {
        this.#power = value;
    }

    getHp() {
        return this.#hp;
    }

    setHp(value) {
        this.#hp = value >= 100 ? 100 : value;
    }

    move() {
    }

    kill() {
        this.status = "dead";
        this.map[this.positionX][this.positionY] = new VoidCell(this.positionX, this.positionY, this.field);
    }
}

class Player extends Entity {
    constructor(x, y, field, map) {
        super(x, y, "tile tileP", field, map);
        this.create();
    }

    move(keyCode) {
        let newX = this.positionX;
        let newY = this.positionY;

        switch (keyCode) {
            case 68: // d
                newX += 1;
                break;
            case 83: //s
                newY += 1;
                break;
            case 65: //a
                newX -= 1;
                break;
            case 87: //w
                newY -= 1;
                break;
        }

        if (this.map[newX][newY] instanceof Health) {
            this.setHp(this.getHp() + this.map[newX][newY].hp)
        } else if (this.map[newX][newY] instanceof Sword) {
            this.setPower(this.getPower() + this.map[newX][newY].power)
        }

        if (this.map[newX][newY] instanceof VoidCell || this.map[newX][newY] instanceof Health || this.map[newX][newY] instanceof Sword) {
            this.positionX = newX;
            this.positionY = newY;
        }

        this.map[this.positionX][this.positionY] = this;
        this.field.append(this.getHTMLFormat())
    }
}

class Enemy extends Entity {
    constructor(x, y, field, map) {
        super(x, y, "tile tileE", field, map);
        this.create();
    }

    #changeXCoordinates(delta) {
        let isCompleted = false;
        if (this.map[this.positionX + delta] !== undefined && this.map[this.positionX + delta][this.positionY] instanceof VoidCell) {
            this.positionX += delta;
            isCompleted = true;
        } else if (this.map[this.positionX - delta] !== undefined && this.map[this.positionX - delta][this.positionY] instanceof VoidCell) {
            this.positionX -= delta;
            isCompleted = true;
        }
        return isCompleted;
    }

    #changeYCoordinates(delta) {
        let isCompleted = false;
        if (this.map[this.positionX][this.positionY + delta] !== undefined && this.map[this.positionX][this.positionY + delta] instanceof VoidCell) {
            this.positionY += delta;
            isCompleted = true;
        } else if (this.map[this.positionX][this.positionY - delta] !== undefined && this.map[this.positionX][this.positionY - delta] instanceof VoidCell) {
            this.positionY -= delta;
            isCompleted = true;
        }
        return isCompleted;
    }

    /**
     * Случайное передвижение по случайно выбранной оси
     */
    move() {
        let delta = Math.round(Math.random()) === 0 ? 1 : -1;

        // x - 0, y - 1
        let xORy = Math.round(Math.random());
        if (xORy === 0) {
            let isCompleted = this.#changeXCoordinates(delta);
            if (!isCompleted) {
                this.#changeYCoordinates(delta);
            }
        } else {
            let isCompleted = this.#changeYCoordinates(delta);
            if (!isCompleted) {
                this.#changeXCoordinates(delta);
            }
        }

        this.map[this.positionX][this.positionY] = this;
        this.field.append(this.getHTMLFormat())
    }
}

class HP extends Tile {
    constructor(x, y, cssStyleName, field, hp) {
        super(x, y, "health", field);
        this.hp = hp;
    }

    getHTMLFormat() {
        return $('<div>').addClass(`${this.cssStyle}`).css({
            "margin-left": `${this.positionX * this.width}px`,
            "margin-top": `${this.positionY * this.width}px`,
            "width": `${this.hp}%`
        });
    }
}