<script setup lang="ts">
import type NonFileReader from "~/components/NonFileReader";
import type YAMLFileReader from "~/components/YAMLFileReader";

const props = defineProps<{
  file: YAMLFileReader
}>()

let tiles: any

let drag = false;

document.addEventListener('mousedown', () => drag = false);
document.addEventListener('mousemove', () => drag = true);
document.addEventListener('mouseup', () => console.log(drag ? 'drag' : 'click'));

//TODO use the code above and implement drag logic. i made a div #float. have fun! you are the goat bruh

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

function mouseLeave() {
  for (const tile of tiles) {
    tile.classList.remove('hover')
  }
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

  const tolerance = 5
  const height = props.file.columnLength + props.file.height
  const width = props.file.rowLength + props.file.width

  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth

  if(windowWidth > windowHeight)
    tileSize.value = `${windowHeight / (height + tolerance)}px`
  else
    tileSize.value = `${windowWidth / (width + tolerance)}px`


  tiles = document.querySelectorAll('[data-row], [data-col]')

  console.log(tileSize)
})

</script>

<template>

  <div id="float"></div>

  <table id="table" @mouseleave="mouseLeave">
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

  --tileSize: v-bind(tileSize);

  line-height: v-bind(tileSize);
}

#float {

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

.tile:not(.clicked):hover {
  background-color: var(--tileHover);
}

.hover {
  background-color: var(--tileHoverLight);
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