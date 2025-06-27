import type YAMLFileReader from "~/components/YAMLFileReader";
import SelectorLogic from "~/components/controls/SelectorLogic";
import {Direction} from "~/components/NonogramLogic";

//TODO make dragging based on the fill and cross keys instead of shift (because that shit is NOT working)
export default class KeyboardControls extends SelectorLogic {
    crossButton?: HTMLInputElement
    fillButton?: HTMLInputElement

    constructor(file: YAMLFileReader, tiles: NodeListOf<Element>, float: Ref, floatNum: Ref, table: Ref) {
        super(file, tiles, float, floatNum);

        //set up keyboard events
        document.onkeydown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    this.arrowInput(e, 'left')
                    break;

                case "ArrowRight":
                    this.arrowInput(e, 'right')
                    break;

                case "ArrowUp":
                    this.arrowInput(e, 'up')
                    break;

                case "ArrowDown":
                    this.arrowInput(e, 'down')
                    break;

                case "z":
                    if (this.fillButton) this.fillButton.checked = true
                    this.selectorAction('fill')
                    break;

                case "x":
                    if (this.crossButton) this.crossButton.checked = true
                    this.selectorAction('cross')
                    break;
            }

            if(e.key == "Z" || e.key == "X")
                this.startDrag()
        }

        document.onkeyup = (e: KeyboardEvent) => {
            if (e.key == "z" || e.key == "x") {
                this.drag = false
            }
        }
    }

    checkDragState(key: string) {
        if(this.drag) {
            switch (key) {
                case "z":
                    //TODO fill dragged tiles and make NonogramLogic unified methods of ending drag and starting drag, maybe as abstracts
            }
        }
    }

    startDrag() {
        if (!this.drag) {
            this.setStartTile(this.previousSelector!)
            console.log("start tile set!")
        }
        this.drag = true
    }

    arrowInput(e: KeyboardEvent, direction: string) {
        e.preventDefault()
        this.directionInput(direction)

        if (this.drag) {
            const dir = (direction == "left" || direction == "right") ? Direction.side : Direction.up
            const tile = this.getSelectorTile()
            this.handleDragDirection(tile, dir)

            const rect = tile.getBoundingClientRect()
            this.showFloat(rect.left, rect.top)
        }
    }

    selectorAction(action: string) {
        this.buttonAction = action
        if (!this.previousSelector) return
        return this.updateTile(this.previousSelector)
    }
}

