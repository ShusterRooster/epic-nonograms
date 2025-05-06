import type YAMLFileReader from "~/components/YAMLFileReader";

const props = defineProps<{
    file: YAMLFileReader
}>()

let tiles: any
let drag = false
const float = ref()
const floatNum = ref('0')

const minDistance = 5
const tileTolerance = 5
const floatOffset = 40
let floatScale = 1

let tileMouseMove = false
let dragCancelled = false

/**
 * mouse over a tile, controls hover highlighting function
 * @param row
 * @param col
 */
function mouseOver(row: number, col: number) {
    const rowTiles = document.querySelectorAll(`[data-row="${row}"]:not(.clicked)`)
    const colTiles = document.querySelectorAll(`[data-col="${col}"]:not(.clicked)`)

    for (const tile of tiles) {
        tile.classList.remove('hover')
    }

    for (const row of rowTiles) {
        row.classList.add("hover");
    }

    for (const col of colTiles) {
        col.classList.add("hover");
    }
}

/**
 * cancels an ongoing drag operation
 */
function cancelDrag() {
    dragCancelled = true

    for (const tile of tiles) {
        tile.classList.remove('hover')
    }

    if (drag) {
        floatNum.value = "X"
        floatScale = 1.3
    }
}

/**
 * Handles return to normal after a drag operation is cancelled
 */
function uncancelDrag() {
    dragCancelled = false
    floatScale = 1
}

let mouseStartPos: [number, number]
let startTile: [string, string]

enum Direction {
    side = 0,
    up
}

/**
 * Mouse down event on a tile. logs startTile and starts drag.
 * @param ev
 */
function mouseDown(ev: MouseEvent) {
    drag = true
    ev.preventDefault()
    mouseStartPos = [ev.clientX, ev.clientY]

    const target = ev.target as HTMLElement;
    startTile = [target.dataset.col!, target.dataset.row!]
}

/**
 * Handles drag events and filters distance
 * @param ev
 */
function mouseMove(ev: MouseEvent) {
    tileMouseMove = true

    if (drag) {
        uncancelDrag()
        const xDiff = ev.clientX - mouseStartPos[0]
        const yDiff = ev.clientY - mouseStartPos[1]
        const distance = Math.sqrt((xDiff ** 2) + (yDiff ** 2))
        const direction = getDirection(xDiff, yDiff)

        if (distance >= minDistance) {
            handleDirection(ev.target as HTMLElement, direction)
        }
    }

    setTimeout(() => (tileMouseMove = false), 1)
}

/**
 * Handles the direction of the drag event. Will lock the x drag or y drag to the starting tile
 * @param target
 * @param direction
 */
function handleDirection(target: HTMLElement, direction: Direction) {
    const data = (direction == Direction.side) ? target.dataset.col! : target.dataset.row!
    const tile = Number.parseInt(data)
    const start = Number.parseInt(startTile[direction])

    //min and max so the for loop can go in order
    const min = Math.min(tile, start)
    let max = Math.max(tile, start)

    // console.log(min, max)
    floatNum.value = String((max - min) + 1)

    //removes all dragged elements for continuous generation
    document.querySelectorAll(`.dragged`).forEach((el) => {
        el.classList.remove('dragged')
    })

    let dragged: HTMLElement

    for (let i = min; i <= max; i++) {
        if (direction == Direction.side)
            dragged = document.querySelector(`[data-col="${i}"][data-row="${startTile[1]}"]`)!
        else
            dragged = document.querySelector(`[data-col="${startTile[0]}"][data-row="${i}"]`)!

        dragged?.classList.add('dragged')
    }
}

/**
 * gets direction based off magnitude of the stronger direction.
 * @param x
 * @param y
 */
function getDirection(x: number, y: number) {
    x = Math.abs(x)
    y = Math.abs(y)

    if (x > y)
        return Direction.side

    return Direction.up
}

/**
 * Will select a clicked tile as selected unless it is already selected, in which case it will revert to normal.
 * @param event
 */
function click(event: Event) {
    updateTile(event.target as HTMLElement)
}

/**
 * Handles tile clicking. Will return the state of the affected tile if it is not locked.
 * If affected tile is locked, it will return undefined.
 * @param target
 */
function updateTile(target: HTMLElement): boolean | undefined {
    if(target.classList.contains('locked')) return;

    const col = Number.parseInt(target.dataset.col!)
    const row = Number.parseInt(target.dataset.row!)
    const filled = isGoalFilled(col, row)

    //removes cross class if it exists
    target.classList.remove('cross')

    //fill on a filled tile = CORRECT, add click
    //fill on an empty tile = WRONG, handle mistake and add wrong
    //do not handle crosses

    //same action, fill tile
    if (filled) {
        target.classList.add('clicked')
        detectChanges(col, row)
    }
    else
        handleMistake(target)

    return filled
}

/**
 * Handles left click event to prevent default and mark tiles as crossed
 * @param event
 */
function leftClick(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLElement
    if(target.classList.contains('locked')) return

    target.classList.add('cross')
}

function handleMistake(element: HTMLElement) {
    element.classList.add('wrong')
}

/**
 * Returns true if '1' and false if '0'
 * @param col
 * @param row
 */
function isGoalFilled(col: number, row: number) {
    return props.file.goal[row][col] == '1'
}

/**
 * Detects changes in the table after a click event. Handles game logic.
 * @param col
 * @param row
 */
function detectChanges(col: number, row: number) {
    const allRow = document.querySelectorAll(`.clicked[data-row="${row}"]`)
    const allCol = document.querySelectorAll(`.clicked[data-col="${col}"]`)

    checkFulfilled(allRow, row, true)
    checkFulfilled(allCol, col, false)
}

let rowsFulfilled = 0
let columnsFulfilled = 0

/**
 * Checks each goal position in each row/col and sees if clicked (since mistakes are handled separately),
 * and greys out numbers that are fulfilled in the grid
 * @param query clicked tiles in each row/col
 * @param n row/col
 * @param parseRow
 */
function checkFulfilled(query: NodeList, n: number, parseRow: boolean) {
    const groups = []

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
    const goalPos = parseRow ? props.file.rowGoalPositions[n] : props.file.columnGoalPositions[n]

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
            const selector = parseRow ? `[data-index="${props.file.rowLength - goalPos.length + i}"]` :
                `[data-index="${props.file.columnLength - goalPos.length + i}"]`

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
        if(parseRow) rowsFulfilled++
        else columnsFulfilled++

        //every row and every column fulfilled, game won condition
        if(rowsFulfilled == props.file.rows.length && columnsFulfilled == props.file.columns.length)
            handleComplete()
    }
}

function handleComplete() {
    alert("you won!!!!! good job :)")
}

const tileSize = ref()

onMounted(async () => {
    // Wait for the next DOM update cycle
    await nextTick()

    const height = props.file.columnLength + props.file.height
    const width = props.file.rowLength + props.file.width

    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth

    //calculates tileSize differently based on window aspect ratio
    if (windowWidth > windowHeight)
        tileSize.value = `${windowHeight / (height + tileTolerance)}px`
    else
        tileSize.value = `${windowWidth / (width + tileTolerance)}px`

    tiles = document.querySelectorAll('[data-row], [data-col]')

    //handles float hiding and removing dragged tiles
    document.addEventListener('mouseup', () => {
        drag = false
        const dragged = document.querySelectorAll(`.dragged`)

        //places dragged tiles onto the table. handles changes
        if (!dragCancelled) {
            for (const tile of dragged) {
                const valid = updateTile(tile as HTMLElement)

                //if there is a mistake, it will cancel the drag operation
                if (valid != undefined && !valid) break;
            }
        }

        dragged.forEach((tile) => {
            tile.classList.remove('dragged')
        })

        float.value.style.visibility = 'hidden'
    })

    //if the document detects mouse movement but if no tiles are detecting it, it will cancel the drag.
    document.addEventListener('mousemove', (ev: MouseEvent) => {
        if (drag) {
            float.value.style.visibility = 'visible'
            float.value.style.transform = `scale(${floatScale})`

            float.value.style.left = `${ev.clientX - floatOffset}px`
            float.value.style.top = `${ev.clientY - floatOffset}px`

            if (!tileMouseMove) {
                cancelDrag()
            }
        }
    })

    // displayGoal()
})

function displayGoal() {
    const goal = props.file.goal

    for (let row = 0; row < goal.length; row++) {
        for (let col = 0; col < goal[row].length; col++) {
            const select = document.querySelector(`[data-col="${col}"][data-row="${row}"]`)

            if (goal[row][col] == '1') {
                select?.classList.add('clicked')
            } else {
                select?.classList.add('cross')
            }
        }
    }
}