export default class NonFileReader {
    width: number
    height: number
    rows: number[][]
    columns: number[][]
    goal: string[]

    dispRows: string[][]
    dispCols: string[][]

    rowLength: number
    columnLength: number

    //optional
    catalogue?: string
    title?: string
    by?: string
    copyright?: string
    license?: string

    constructor(raw: string) {
        this.width = this.findSingleNumber('width', raw)
        this.height = this.findSingleNumber('height', raw)

        this.rows = this.findMany('rows', raw)
        this.columns = this.findMany('columns', raw)
        this.goal = this.decodeGoal(raw)

        this.dispRows = this.adjust(this.rows)
        this.dispCols = this.adjust(this.columns)

        this.rowLength = this.dispRows[0].length
        this.columnLength = this.dispCols[0].length

        this.catalogue = this.findSingle('catalogue', raw)
        this.title = this.findSingle('title', raw)
        this.by = this.findSingle('by', raw)
        this.copyright = this.findSingle('copyright', raw)
        this.license = this.findSingle('license', raw, false)
    }

    findSingle(tag: string, raw: string, hasQuote = true): string | undefined {
        const index = raw.indexOf(tag)
        const start = index + tag.length + 1
        const end = raw.indexOf('\n', start)

        const result = raw.substring(start, end)
        return !hasQuote ? result : result.substring(1, result.length - 1)
    }

    findSingleNumber(tag: string, raw: string): number {
        return parseInt(this.findSingle(tag, raw, false)!)
    }

    //used for rows and columns
    findMany(tag: string, raw: string) {
        const index = raw.indexOf(tag)
        const start = index + tag.length + 1
        const end = raw.indexOf('\n\n', start)

        const split = raw.substring(start, end).split('\n')
        const arr: number[][] = []

        for (const i in split) {
            arr[i] = split[i].split(',').map((i) => Number(i))
        }

        return arr
    }

    numToStrArr(arr: number[][]) {
        const str: string[][] = []

        for (const i in arr) {
            str[i] = arr[i].map((j) => String(j))
        }

        return str
    }

    adjust(num: number[][]) {
        let max = 0

        for (const a of num) {
            max = Math.max(max, a.length)
        }

        const arr = this.numToStrArr(num)

        for (const a of arr) {
            if(a.length < max) {
                const diff = max - a.length

                for (let i = 0; i < diff; i++) {
                    a.unshift(' ')
                }
            }
        }

        return arr
    }

    decodeGoal(raw: string) {
        const goal = this.findSingle('goal', raw)!
        const arr: string[] = []

        for (let i = 0; i < goal.length; i += this.width) {
            const end = i + (this.width)

            arr[i / this.width] = goal.substring(i, end)
        }

        return arr
    }

    //01100011010010101110101001010000110010100101111000

    /*
    01100
    01101
    00101
    01110
    10100
    10100
    00110
    01010
    01011
    11000
     */

}