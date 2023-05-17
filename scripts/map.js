class Map {
    // Двумерный массив, в котором хранятся объекты дочерних классов от Tile, например, WallCell, VoidCell, Enemy, Person
    map = [];

    width = 40;
    height = 24;

    player;
    enemiesList = [];

    linesPositionsArray = []

    constructor() {
        this.field = $('.field');
    }

    createMap() {
        this.#fillMapWithWalls();
        this.#createSquares();
        this.#createHorizontalAndVerticalLines();
        this.#putSwordAndHealthTile();
        this.#putPlayer();
        this.#putEnemies();

        $(document).on("keydown", (e) => {
            if ([65, 68, 83, 87, 32].includes(e.keyCode) && this.player.status === "live") {
                this.redrawEntities(e);
            }
        });
    }

    /**
     * Перересовка поля с изменением положений сущностей
     * @param e - event-keydown объект
     */
    redrawEntities(e) {
        let newXFrom = this.player.positionX - 1 >= 0 ? this.player.positionX - 1 : this.player.positionX;
        let newXEnd = this.player.positionX + 1 <= this.width ? this.player.positionX + 1 : this.player.positionX;

        let newYFrom = this.player.positionY - 1 >= 0 ? this.player.positionY - 1 : this.player.positionY;
        let newYEnd = this.player.positionY + 1 <= this.height ? this.player.positionY + 1 : this.player.positionY;

        for (let i = newXFrom; i <= newXEnd; i++) {
            if (this.player.status === "dead") {
                break
            }

            for (let j = newYFrom; j <= newYEnd; j++) {
                if (this.player.status === "dead") {
                    break
                }
                if (this.map[i][j] instanceof Enemy) {
                    // Нанесение урона при нажатии на пробел
                    if (e.keyCode === 32) {
                        this.map[i][j].setHp(this.map[i][j].getHp() - this.player.getPower());
                        if (this.map[i][j].getHp() <= 0) {
                            this.enemiesList = this.enemiesList.filter(el => el !== this.map[i][j]);
                            this.map[i][j].kill();
                            continue;
                        }
                    }

                    // Получение урона
                    this.player.setHp(this.player.getHp() - this.map[i][j].getPower());
                    if (this.player.getHp() <= 0) {
                        this.player.kill();
                    }
                }
            }
        }

        this.#redrawMap();
        this.#drawEntities(e)
    }

    #drawEntities(e) {
        if (this.player.status === "live") {
            this.player.move(e.keyCode);

            for (let i = 0; i < this.enemiesList.length; i++) {
                this.enemiesList[i].move();
            }
        }
    }

    /**
     * Заполнение всего поля стенами
     */
    #fillMapWithWalls() {
        for (let i = 0; i < this.width; i++) {
            this.map[i] = [];
            for (let j = 0; j < this.height; j++) {
                this.map[i][j] = new WallCell(i, j, this.field);
                // this.field.append(this.map[i][j].getHTMLFormat());
            }
        }
    }

    /**
     * Вставка случайного кол-ва прямоугольников со случайными размерами на поле
     */
    #createSquares() {
        const minRoomsCount = 5;
        const maxRoomsCount = 10;

        const minWidthOfRoom = 3;
        const maxWidthOfRoom = 8;

        const roomsCount = Math.round(Math.random() * (maxRoomsCount - minRoomsCount) + minRoomsCount);

        for (let i = 0; i < roomsCount; i++) {
            let roomWidth = Math.round(Math.random() * (maxWidthOfRoom - minWidthOfRoom) + minWidthOfRoom);
            let roomHeight = Math.round(Math.random() * (maxWidthOfRoom - minWidthOfRoom) + minWidthOfRoom);

            let positionX = Math.round(Math.random() * (this.width - roomWidth));
            let positionY = Math.round(Math.random() * (this.height - roomHeight));
            this.linesPositionsArray.push([positionX, positionY]);

            for (let localX = positionX; localX < positionX + roomWidth; localX++) {
                for (let localY = positionY; localY < positionY + roomHeight; localY++) {
                    this.map[localX][localY] = new VoidCell(localX, localY, this.field);
                }
            }
        }
    }

    /**
     * Вставка случайного кол-ва горизонтальных и вертикальных линий на поле
     */
    #createHorizontalAndVerticalLines() {
        for (let i = 0; i < this.linesPositionsArray.length; i++) {
            for (let j = 0; j < this.height; j++) {
                this.map[this.linesPositionsArray[i][0]][j] = new VoidCell(this.linesPositionsArray[i][0], j, this.field);
            }
        }

        for (let i = 0; i < Math.round(this.linesPositionsArray.length); i++) {
            for (let j = 0; j < this.width; j++) {
                this.map[j][this.linesPositionsArray[i][1]] = new VoidCell(j, this.linesPositionsArray[i][1], this.field);
            }
        }
    }

    /**
     * Считает кол-во пустых клеток на поле
     * @returns {number} - кол-во пустых клеток на поле
     */
    #countVoidCells() {
        let countOfVoidCells = 0;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                countOfVoidCells += this.map[i][j] instanceof VoidCell;
            }
        }
        return countOfVoidCells;
    }

    /**
     * Ищет координаты пустой клетки по порядковому номеру
     * @param number - порядковый номер пустой клетки из всего количества
     * @returns {number[]} - координаты пустой клетки под номером {@param number}
     */
    #positionOfVoidCell(number) {
        let localCountOfVoidCell = 0;

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                localCountOfVoidCell += this.map[i][j] instanceof VoidCell
                if (localCountOfVoidCell === number) {
                    return [i, j];
                }
            }
        }
    }

    /**
     * Вставка мечей и зелей с хп на поле в пустые ячейки случайным образом
     */
    #putSwordAndHealthTile() {
        const swordCount = 2;
        const healthCount = 10;

        const allItemPositionNumber = range(1, this.#countVoidCells(), swordCount + healthCount);

        let swordPositionList = []
        let healthPositionList = []
        for (let i = 0; i < swordCount; i++) {
            swordPositionList.push(this.#positionOfVoidCell(allItemPositionNumber[i]));
        }

        for (let i = swordCount; i < healthCount + swordCount; i++) {
            healthPositionList.push(this.#positionOfVoidCell(allItemPositionNumber[i]));
        }

        // Вынес в отдельные циклы, так как надо было сначала просчитать все координаты, не уменьшая общее число пустых клеток,
        // а если бы сразу же начала заполнять, то пришлось бы учитывать, что кол-во пустых клеток уменьшается
        for (let i = 0; i < swordCount; i++) {
            let [x, y] = swordPositionList[i];
            this.map[x][y] = new Sword(x, y, this.field);
        }
        for (let i = 0; i < healthCount; i++) {
            let [x, y] = healthPositionList[i];
            this.map[x][y] = new Health(x, y, this.field);
        }
    }

    /**
     * Вставка главного героя на поле в пустую клетку случайным образом
     */
    #putPlayer() {
        const playerVoidCellNumber = Math.round(Math.random() * this.#countVoidCells());
        let [x, y] = this.#positionOfVoidCell(playerVoidCellNumber);
        this.player = new Player(x, y, this.field, this.map)
        this.map[x][y] = this.player;
    }

    /**
     * Вставка врагов на поле в пустые клетки случайным образом
     */
    #putEnemies() {
        const countOfEnemies = 10;

        const enemiesVoidCellNumbers = range(1, this.#countVoidCells(), countOfEnemies);
        let enemiesPositionList = [];
        for (let i = 0; i < countOfEnemies; i++) {
            enemiesPositionList.push(this.#positionOfVoidCell(enemiesVoidCellNumbers[i]));
        }

        for (let i = 0; i < countOfEnemies; i++) {
            let [x, y] = enemiesPositionList[i];
            this.enemiesList.push(new Enemy(x, y, this.field, this.map))
            this.map[x][y] = this.enemiesList[i];
        }
    }

    /**
     * Перерисовка карты без сущностей
     */
    #redrawMap() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.map[i][j] instanceof Entity) {
                    // this.map[i][j] = new Entity(i, j, "tile", this.field, this.map);
                    this.map[i][j] = new VoidCell(i, j, this.field);
                }
            }
        }

        this.field.empty();
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.map[i][j].create();
            }
        }
    }
}