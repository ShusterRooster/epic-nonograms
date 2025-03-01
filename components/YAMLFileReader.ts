export default class YAMLFileReader {
    width: number
    height: number
    rows: string[][]
    columns: string[][]
    goal: string[]

    rowLength: number
    columnLength: number

    //optional
    catalogue?: string
    title?: string
    by?: string
    copyright?: string
    license?: string

    constructor(data: any) {
        this.width = data.width
        this.height = data.height

        this.rows = this.adjustGridNums(data.rows)
        this.columns = this.adjustGridNums(data.columns)
        this.goal = this.decodeGoal(data.goal)

        this.rowLength = this.rows[0].length
        this.columnLength = this.columns[0].length

        this.catalogue = data.catalogue
        this.title = data.title
        this.by = data.by
        this.copyright = data.copyright
        this.license = data.license
    }

    //this decodes the yaml string and then sends it to have max spaces
    private adjustGridNums(str: string) {
        const space = str.substring(0, str.length - 2).split(' ')
        const nums = []

        for (const s of space) {
            nums.push(s.split(','))
        }

        return this.adjust(nums)
    }

    private adjust(arr: string[][]) {
        let max = 0

        for (const a of arr) {
            max = Math.max(max, a.length)
        }

        for (const a of arr) {
            if (a.length < max) {
                const diff = max - a.length

                for (let i = 0; i < diff; i++) {
                    a.unshift(' ')
                }
            }
        }


        return arr
    }

    private decodeGoal(goal: string) {
        const arr: string[] = []

        for (let i = 0; i < goal.length; i += this.width) {
            arr[i / this.width] = goal.substring(i, i + (this.width))
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