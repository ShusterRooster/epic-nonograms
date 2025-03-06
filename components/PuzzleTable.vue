<script setup lang="ts">
import type NonFileReader from "~/components/NonFileReader";
import type YAMLFileReader from "~/components/YAMLFileReader";

const props = defineProps<{
  file: YAMLFileReader
}>()

let tiles: any
let drag = false
const float = ref()
const floatNum = ref('0')

const minDistance = 2
const tileTolerance = 5
const floatOffset = 40
let floatScale = 1

let tileMouseMove = false
let dragCancelled = false

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

function mouseDown(ev: MouseEvent) {
  drag = true
  ev.preventDefault()
  mouseStartPos = [ev.clientX, ev.clientY]

  const target = ev.target as HTMLElement;
  startTile = [target.dataset.col!, target.dataset.row!]

  console.log('startTile:', startTile)
}

function mouseMove(ev: MouseEvent) {
  tileMouseMove = true

  if (drag) {
    uncancelDrag()
    const xDiff = ev.clientX - mouseStartPos[0]
    const yDiff = ev.clientY - mouseStartPos[1]
    const distance = Math.sqrt((xDiff ** 2) + (yDiff ** 2))
    const direction = getDirection(xDiff, yDiff)
    const target = ev.target as HTMLElement;

    if (distance >= minDistance) {
      handleDirection(target, direction)
    }
  }

  setTimeout(() => (tileMouseMove = false), 1)

}

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

function getDirection(x: number, y: number) {
  x = Math.abs(x)
  y = Math.abs(y)

  if (x > y)
    return Direction.side

  return Direction.up
}

function click(event: Event) {
  const target = event.target as HTMLElement;
  target.classList.add('clicked')
}

function leftClick(event: Event) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  target.classList.add('cross')
}


const tileSize = ref()

onMounted(async () => {
  // Wait for the next DOM update cycle
  await nextTick()

  const height = props.file.columnLength + props.file.height
  const width = props.file.rowLength + props.file.width

  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth

  if (windowWidth > windowHeight)
    tileSize.value = `${windowHeight / (height + tileTolerance)}px`
  else
    tileSize.value = `${windowWidth / (width + tileTolerance)}px`

  tiles = document.querySelectorAll('[data-row], [data-col]')

  //handles float hiding and removing dragged tiles
  document.addEventListener('mouseup', (ev: MouseEvent) => {
    drag = false

    const dragged = document.querySelectorAll(`.dragged`)

    if (!dragCancelled) {
      dragged.forEach((tile) => {
        tile.classList.add('clicked')
      })
    }

    dragged.forEach((tile) => {
      tile.classList.remove('dragged')
    })

    float.value.style.visibility = 'hidden'
  })

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
})

function displayGoal() {
  const goal = props.file.goal

  for (let row = 0; row < goal.length; row++) {
    for (let col = 0; col < goal[row].length; col++) {
      const select = document.querySelector(`[data-col="${col}"][data-row="${row}"]`)

      if(goal[row][col] == '1') {
        select?.classList.add('clicked')
      }
      else {
        select?.classList.add('cross')
      }
    }
  }
}

</script>

<template>

  <div id="float" ref="float">
    <p>{{ floatNum }}</p>
  </div>

  <table id="table" @mouseleave="cancelDrag">
    <tr>
      <!--      empty spaces for spacing-->
      <th scope="col"></th>
      <th class="columnHead" v-for="(col, index) in props.file.columns" scope="col" :data-col="index">

        <div class="columnGrid">
          <div v-for="num in col">
            {{ num }}
          </div>
        </div>
      </th>

    </tr>

    <tr class="row" v-for="(row, rowIndex) in props.file.rows">
      <th class="rowHead" scope="row" :data-row="rowIndex">
        <div> </div>

        <div v-for="num in row">
          {{ num }}
        </div>
      </th>


      <td class="tile"
          v-for="(i, columnIndex) in props.file.columns"
          :data-row="rowIndex"
          :data-col="columnIndex"
          @mouseover="mouseOver(rowIndex, columnIndex)"
          @mousedown="mouseDown($event)"
          @mousemove="mouseMove($event)"
          @click="click"
          @contextmenu="leftClick"></td>
    </tr>

  </table>
</template>

<style scoped>

th, td, tr {
  padding: 0;
}

#table {
  display: table;
  table-layout: fixed;
  border-collapse: collapse;
  font-family: "Kode Mono", monospace;
  counter-reset: row;

  --border: solid #252e1f;
  --bThick: 1px;

  --thick: solid #2f3624;
  --tThick: 3px;

  --space: 0.25rem;
  --counterColor: wheat;

  --headBG: #0f1e0f;
  --headText: #a9c3a8;

  --tileColor: #0a130a;
  --tileHover: #4c534c;
  --tileHoverLight: #304330;

  --dragColor: yellow;


  line-height: v-bind(tileSize);
}

#float {
  position: absolute;
  visibility: hidden;
  width: 35px;
  height: 35px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  transition: transform 0.2s ease-in-out;
  transform: scale(0.7);

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.64);

  background-color: #650040;
  border-radius: 5px;
  z-index: 99;
}

#float > * {
  color: wheat;
  font-weight: 800;
  font-family: "Kode Mono", monospace;
  text-align: center;

  margin: auto;
}

th {
  font-weight: normal;
  color: var(--headText);
}

.columnGrid {
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 1fr;

  align-items: end;
  align-content: space-evenly;

  border: var(--border);
  border-width: 0 var(--bThick) 0 var(--bThick);
}

.columnGrid * {
  border: var(--border);
  border-width: var(--bThick) 0 0 0;
}

.rowHead {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  text-align: justify-all;
  align-items: center;

  align-content: center;
  grid-template-rows: 100%;
}

.rowHead * {
  border: var(--border);
  border-width: 0 0 0 var(--bThick);
  width: v-bind(tileSize);
}

.rowHead, .columnHead {
  background-color: var(--headBG);
  user-select: none;
}

.row {
  border: var(--border);
  border-width: var(--bThick) 0 var(--bThick) 0;
}

.row:first-child, .row:last-child {
  border-width: 0;
}

.tile {
  position: relative;
  width: v-bind(tileSize);
  height: v-bind(tileSize);

  background-color: var(--tileColor);
  border: var(--border);
  border-width: var(--bThick);
}

/*vertical*/
.row td:nth-child(5n + 1), .columnHead:nth-child(5n + 1) {
  border: var(--thick);
  border-width: 0 var(--tThick) 0 0;
}

/*horizontal*/
.row:nth-child(5n + 1) {
  border: var(--thick);
  border-width: 0 0 var(--tThick) 0;
  counter-increment: row 5;
}

.row:nth-child(5n + 1):after {
  right: 0;
  content: counter(row);
  color: var(--counterColor);
  margin-left: var(--space);
}

.tile:not(.clicked, .dragged):hover {
  background-color: var(--tileHover);
}

.hover {
  background-color: var(--tileHoverLight);
}

.dragged {
  //background-color: var(--dragColor);
  background-color: yellow;
}

.clicked {
  background-color: wheat;
}

.cross:before {
  content: url('/cross.svg');
  position: absolute;
  top: 0;
  left: 0;

  margin: 10% 0 0 10%;

  width: 80%;
  height: 80%;

}
</style>

<style>
body {
  background-color: #030c03;
}
</style>