import type YAMLFileReader from "~/components/YAMLFileReader";
import SelectorLogic from "~/components/SelectorLogic";

export default class DesktopControls extends SelectorLogic {
    crossButton?: HTMLInputElement
    fillButton?: HTMLInputElement
    buttonAction = 'fill'

    constructor(file: YAMLFileReader, tiles: NodeListOf<Element>, float: Ref, floatNum: Ref, table: Ref) {
        super(file, tiles, float, floatNum);

        for (const tile of tiles) {
            const target = tile as HTMLElement

            target.onmouseover = (e) => this.mouseOver(e)
            target.onmousedown = (e) => this.mouseDown(e)
            target.onmousemove = (e) => this.mouseMove(e)
            target.onclick = (e) => this.click(e)
            target.oncontextmenu = (e) => this.leftClick(e)
        }

        document.onmousemove = (e) => this.documentMouseMove(e)
        document.onmouseup = () => this.documentMouseUp()
        table.value.onmouseleave = () => this.cancelDrag()

        //set up keyboard events
        document.onkeydown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault()
                    this.directionInput('left')
                    break;

                case "ArrowRight":
                    e.preventDefault()
                    this.directionInput('right')
                    break;

                case "ArrowUp":
                    e.preventDefault()
                    this.directionInput('up')
                    break;

                case "ArrowDown":
                    e.preventDefault()
                    this.directionInput('down')
                    break;

                case "z":
                    if(this.fillButton) this.fillButton.checked = true
                    this.selectorAction('fill')
                    break;

                case "x":
                    if(this.crossButton) this.crossButton.checked = true
                    this.selectorAction('cross')
                    break;

            }
        }
    }

    /**
     * mouse over a tile, controls hover highlighting function
     * @param ev
     */
    mouseOver(ev: MouseEvent) {
        //remove old hover
        for (const tile of this.tiles) {
            tile.classList.remove('hover')
        }

        const target = ev.target as HTMLElement
        const row = target.dataset.row!
        const col = target.dataset.col!

        const rowTiles = document.querySelectorAll(`[data-row="${row}"]:not(.clicked)`)
        const colTiles = document.querySelectorAll(`[data-col="${col}"]:not(.clicked)`)

        for (const row of rowTiles) {
            row.classList.add("hover");
        }

        for (const col of colTiles) {
            col.classList.add("hover");
        }
    }

    /**
     * Mouse down event on a tile. logs startTile and starts drag.
     * @param ev
     */
    mouseDown(ev: MouseEvent) {
        this.drag = true
        ev.preventDefault()
        this.mouseStartPos = [ev.clientX, ev.clientY]

        const target = ev.target as HTMLElement;
        this.startTile = [Number.parseInt(target.dataset.col!), Number.parseInt(target.dataset.row!)]
    }

    /**
     * Handles drag events and filters distance
     * @param ev
     */
    mouseMove(ev: MouseEvent) {
        this.tileMouseMove = true

        if (this.drag) {
            this.uncancelDrag()
            const xDiff = ev.clientX - this.mouseStartPos[0]
            const yDiff = ev.clientY - this.mouseStartPos[1]
            const distance = Math.sqrt((xDiff ** 2) + (yDiff ** 2))
            const direction = this.getDirection(xDiff, yDiff)

            if (distance >= this.minDistance) {
                this.handleDragDirection(ev.target as HTMLElement, direction)
            }
        }

        setTimeout(() => (this.tileMouseMove = false), 1)
    }

    /**
     * Will select a clicked tile as selected unless it is already selected, in which case it will revert to normal.
     * @param event
     */
    click(event: Event) {
        this.updateTile(event.target as HTMLElement)

    }

    /**
     * Handles left click event to prevent default and mark tiles as crossed
     * @param event
     */
    leftClick(event: Event) {
        event.preventDefault();
        this.crossTile(event.target as HTMLElement)
    }

    crossTile(tile: HTMLElement) {
        if (tile.classList.contains('locked')) return
        tile.classList.add('cross')
    }

    /**
     * Handles dragging logic when mouse up. Allows for 1 mistake to be made.
     */
    documentMouseUp() {
        this.drag = false
        const dragged = document.querySelectorAll(`.dragged`)

        //places dragged tiles onto the table. handles changes
        if (!this.dragCancelled) {
            for (const tile of dragged) {
                const valid = this.updateTile(tile as HTMLElement)

                //if there is a mistake, it will cancel the drag operation
                if (valid != undefined && !valid) break;
            }
        }

        dragged.forEach((tile) => {
            tile.classList.remove('dragged')
        })

        this.float.value.style.visibility = 'hidden'
    }

    /**
     * If the document detects mouse movement but if no tiles are detecting it, it will cancel the drag.
     * @param ev
     */
    documentMouseMove(ev: MouseEvent) {
        if (this.drag) {
            this.float.value.style.visibility = 'visible'
            this.float.value.style.transform = `scale(${this.floatScale})`

            this.float.value.style.left = `${ev.clientX - this.floatOffset}px`
            this.float.value.style.top = `${ev.clientY - this.floatOffset}px`

            if (!this.tileMouseMove) {
                this.cancelDrag()
            }
        }
    }

    selectorAction(action: string) {
        if(!this.previousSelector) return

        switch (action) {
            case "cross":
                this.crossTile(this.previousSelector)
                break;

            case "fill":
                this.updateTile(this.previousSelector)
        }
    }
}

