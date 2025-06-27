import NonogramLogic from "~/components/NonogramLogic";

export default class SelectorLogic extends NonogramLogic {
    previousSelector?: HTMLElement
    selectorPosition = [0, 0]
    previousHighlighted?: NodeListOf<Element>

    directionInput(direction: string) {
        let move!: [number, number]

        switch (direction) {
            case 'up':
                move = [0, -1]
                break;

            case 'right':
                move = [1, 0]
                break;

            case 'down':
                move = [0, 1]
                break;

            case 'left':
                move = [-1, 0]
                break;
        }

        this.updateSelector(move)
    }

    /**
     * Animates d-pad selector coming into view
     */
    showSelector() {
        const selector = this.getTile(this.selectorPosition[0], this.selectorPosition[1])
        selector.classList.add('selected')
        selector.style.opacity = '1'

        this.previousSelector = selector
    }

    updateSelector(move: [number, number]) {
        //remove the old highlighted tiles
        if(this.previousHighlighted) {
            this.previousHighlighted.forEach((el) => {
                el.classList.remove('selectedTile')
            })

            //remove previous selector tile
            this.previousSelector!.classList.remove('selected')
        }

        //update position
        this.selectorPosition[0] += move[0]
        this.selectorPosition[1] += move[1]

        this.limitSelectorPosition()

        this.previousHighlighted = this.getSelectorTiles()
        this.previousHighlighted.forEach((el) => {
            el.classList.add('selectedTile')
        })

        //add focus point special highlighting for d-pad
        this.previousSelector = this.getTile(this.selectorPosition[0], this.selectorPosition[1])
        this.previousSelector.classList.remove('selectedTile')
        this.previousSelector.classList.add('selected')
    }

    /**
     * Ensures selector cannot move beyond bounds
     */
    limitSelectorPosition() {
        const columns = this.file.columns.length - 1
        const rows = this.file.rows.length - 1

        if(this.selectorPosition[0] < 0)
            this.selectorPosition[0] = columns
        else if(this.selectorPosition[0] > columns)
            this.selectorPosition[0] = 0

        if(this.selectorPosition[1] < 0)
            this.selectorPosition[1] = rows
        else if(this.selectorPosition[1] > rows)
            this.selectorPosition[1] = 0
    }

    getSelectorTile() {
       return this.getTile(this.selectorPosition[0], this.selectorPosition[1])
    }

    getSelectorTiles() {
        //all in the matching row and col
        return document.querySelectorAll(`[data-col="${this.selectorPosition[0]}"]:not(.clicked, .dragCross, .dragFill), 
        [data-row="${this.selectorPosition[1]}"]:not(.clicked, .dragCross, .dragFill)`)
    }
}