import type YAMLFileReader from "~/components/YAMLFileReader";

export enum Direction {
    side = 0,
    up
}

export default abstract class NonogramLogic {
    rowsFulfilled = 0
    columnsFulfilled = 0

    floatScale = 1
    floatOffset = 40

    tileMouseMove = false
    dragCancelled = false

    drag = false
    minDistance = 5

    mouseStartPos!: [number, number]
    startTile!: [number, number]

    file: YAMLFileReader
    tiles: NodeListOf<Element>

    float: Ref
    floatNum: Ref
    buttonAction = 'fill'

    protected constructor(file: YAMLFileReader, tiles: NodeListOf<Element>, float: Ref, floatNum: Ref) {
        this.file = file
        this.tiles = tiles

        this.float = float
        this.floatNum = floatNum
    }

    /**
     * Checks each goal position in each row/col and sees if clicked (since mistakes are handled separately),
     * and greys out numbers that are fulfilled in the grid
     * @param query clicked tiles in each row/col
     * @param n row/col
     * @param parseRow
     */
    checkFulfilled(query: NodeList, n: number, parseRow: boolean) {
        const groups: number[] = []

        //gets the tile numbers in the collection that are clicked
        for (const tile of query) {
            const target = tile as HTMLElement;
            const data = parseRow ? target.dataset.col! : target.dataset.row!
            groups.push(Number.parseInt(data))
        }

        const dataSelection = parseRow ? `[data-row="${n}"]` : `[data-col="${n}"]`

        //remove fulfilled class from old instances to allow for continuous update
        document.querySelectorAll(dataSelection + `[data-index]`).forEach((el) => {
            (el as HTMLElement).classList.remove('fulfilled')
        })

        //gets goal positions for the appropriate row/col
        const goalPos = parseRow ? this.file.rowGoalPositions[n] : this.file.columnGoalPositions[n]

        //goes for each row's goal position
        for (let i = 0; i < goalPos.length; i++) {
            const pos = goalPos[i]
            let fulfilled = true

            //checks each position
            for (let p = pos.start; p < pos.start + pos.length; p++) {
                if (!groups.includes(p)) fulfilled = false
            }

            if (fulfilled) {
                //magic nonsense that finds the index of the number in the header that is fulfilled
                const selector = parseRow ? `[data-index="${this.file.rowLength - goalPos.length + i}"]` :
                    `[data-index="${this.file.columnLength - goalPos.length + i}"]`

                const fullNum = document.querySelector(dataSelection + selector)
                fullNum!.classList.add("fulfilled")
            }
        }

        //fully fulfilled condition
        if (document.querySelectorAll(`.fulfilled${dataSelection}[data-index]`).length == goalPos.length) {

            //make all non-clicked and non-wrong tiles crossed out
            document.querySelectorAll(`.tile${dataSelection}:not(.clicked, .wrong)`).forEach((el) => {
                (el as HTMLElement).classList.add('cross')
            })

            //make fulfilled row/col locked to prevent editing
            document.querySelectorAll(`.tile${dataSelection}`).forEach((el) => {
                (el as HTMLElement).classList.add('locked')
            })

            //adds row/col to fulfilled count
            if (parseRow) this.rowsFulfilled++
            else this.columnsFulfilled++

            //every row and every column fulfilled, game won condition
            if (this.rowsFulfilled == this.file.rows.length &&
                this.columnsFulfilled == this.file.columns.length)
                this.handleComplete()
        }
    }

    handleMistake(element: HTMLElement) {
        element.classList.add('wrong')
    }

    /**
     * Returns true if goal is '1' and false if '0'
     * @param col
     * @param row
     */
    isGoalFilled(col: number, row: number) {
        return this.file.goal[row][col] == '1'
    }

    /**
     * Detects changes in the table after a click event. Handles game logic.
     * @param col
     * @param row
     */
    detectChanges(col: number, row: number) {
        const allRow = document.querySelectorAll(`.clicked[data-row="${row}"]`)
        const allCol = document.querySelectorAll(`.clicked[data-col="${col}"]`)

        this.checkFulfilled(allRow, row, true)
        this.checkFulfilled(allCol, col, false)
    }

    handleComplete() {
        alert("you won!!!!! good job :)")
    }

    /**
     * Handles tile clicking. Will return the state of the affected tile if it is not locked.
     * If affected tile is locked or just undoing a cross, it will return undefined.
     * @param target
     */
    updateTile(target: HTMLElement): boolean | undefined {
        if (target.classList.contains('locked')) return;

        const col = Number.parseInt(target.dataset.col!)
        const row = Number.parseInt(target.dataset.row!)
        const goalfilled = this.isGoalFilled(col, row)

        //removes cross class if it exists and exits
        if(target.classList.contains('cross')) {
            target.classList.remove('cross')
            return
        }

        if(this.buttonAction == 'fill') {
            //fill on a filled tile = CORRECT, add click
            //fill on an empty tile = WRONG, handle mistake and add wrong
            //do not handle crosses
            if (goalfilled) {
                target.classList.add('clicked')
                this.detectChanges(col, row)
            } else
                this.handleMistake(target)
        }
        else if(this.buttonAction == 'cross') {
            target.classList.add('cross')
        }

        return goalfilled
    }

    getTile(col: number, row: number) {
        return document.querySelector(`[data-col="${col}"][data-row="${row}"]`) as HTMLElement
    }

    setStartTile(target: EventTarget) {
        const elt = target as HTMLElement
        this.startTile = [Number.parseInt(elt.dataset.col!), Number.parseInt(elt.dataset.row!)]
    }

    /**
     * Handles the direction of the drag event. Will lock the x drag or y drag to the starting tile
     * @param target
     * @param direction
     */
    handleDragDirection(target: HTMLElement, direction: Direction) {
        const data = (direction == Direction.side) ? target.dataset.col! : target.dataset.row!
        const tile = Number.parseInt(data)
        const start = this.startTile[direction]

        //min and max so the for loop can go in order
        const min = Math.min(tile, start)
        let max = Math.max(tile, start)

        // console.log(min, max)
        this.floatNum.value = String((max - min) + 1)

        //removes all dragged elements for continuous generation
        document.querySelectorAll(`.dragFill, .dragCross`).forEach((el) => {
            el.classList.remove('.dragFill', '.dragCross')
        })

        let dragged: HTMLElement
        const mode = this.buttonAction == 'fill' ? 'dragFill' : 'dragCross'

        for (let i = min; i <= max; i++) {
            if (direction == Direction.side)
                dragged = this.getTile(i, this.startTile[1])
            else
                dragged = this.getTile(this.startTile[0], i)

            dragged?.classList.add(mode)
        }
    }

    showFloat(x: number, y: number) {
        this.float.value.style.visibility = 'visible'
        this.float.value.style.transform = `scale(${this.floatScale})`

        this.float.value.style.left = `${x - this.floatOffset}px`
        this.float.value.style.top = `${y - this.floatOffset}px`
    }

    displayGoal() {
        const goal = this.file.goal

        for (let row = 0; row < goal.length; row++) {
            for (let col = 0; col < goal[row].length; col++) {
                const select = this.getTile(col, row)

                if (goal[row][col] == '1') {
                    select?.classList.add('clicked')
                } else {
                    select?.classList.add('cross')
                }
            }
        }
    }
}