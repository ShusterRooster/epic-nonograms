<script setup lang="ts">
import type YAMLFileReader from "~/components/YAMLFileReader";
import KeyboardControls from "~/components/controls/KeyboardControls";

const props = defineProps<{
  file: YAMLFileReader
}>()

let tiles: NodeListOf<Element>
const tileTolerance = 1

const tileSize = ref()
const floatNum = ref('0')
const float = ref()
const table = ref()

let controls: KeyboardControls

const emit = defineEmits({
  ready: (controls: KeyboardControls) => {
    return controls
  }
})

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

  controls = new KeyboardControls(props.file, tiles, float, floatNum, table)
  emit("ready", controls)
})

</script>

<template>

  <div id="float" ref="float">
    <p>{{ floatNum }}</p>
  </div>

  <!--  <div id="helper" ref="helper">-->
  <!--  </div>-->

  <!--  <div id="health">-->
  <!--    <div v-for="x in healthCount" class="heart"></div>-->
  <!--  </div>-->

  <table id="table" ref="table">
  <tr>
    <!--      empty spaces for spacing-->
    <th scope="col"></th>
    <th class="columnHead" v-for="(col, colIndex) in props.file.columns" scope="col" :data-col="colIndex">

      <div class="columnGrid">
        <div v-for="(num, index) in col" :data-col="colIndex" :data-index="index" style="position: relative">
          {{ num }}
        </div>
      </div>
    </th>

  </tr>

  <tr class="row" v-for="(row, rowIndex) in props.file.rows">
    <th class="rowHead" scope="row" :data-row="rowIndex">

      <div v-for="(num, index) in row" :data-row="rowIndex" :data-index="index" style="position: relative">
        {{ num }}
      </div>
    </th>


    <td class="tile" v-for="(i, columnIndex) in props.file.columns" :data-row="rowIndex" :data-col="columnIndex"></td>
  </tr>
  </table>
</template>

<style scoped>
@import "~/assets/style.css";

th,
td,
tr {
  padding: 0;
}

#table {
  display: table;
  table-layout: fixed;
  border-collapse: collapse;
  font-family: "Kode Mono", monospace;
  counter-reset: row;
  line-height: v-bind(tileSize);
}

#helper {
  background: url("~/assets/messageBubble.svg") no-repeat center center;
  background-size: cover;
  position: absolute;
  width: v-bind(tileSize);
  height: v-bind(tileSize);
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

  background-color: var(--floatColor);
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

  border: var(--border) solid;
  border-width: 0 var(--borderThickness) 0 var(--borderThickness);
}

.columnGrid * {
  border: var(--border) solid;
  border-width: var(--borderThickness) 0 0 0;
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
  border: var(--border) solid;
  border-width: 0 0 0 var(--borderThickness);
  width: v-bind(tileSize);
}

.rowHead,
.columnHead {
  background-color: var(--headBG);
  user-select: none;
}

.row {
  border: var(--border) solid;
  border-width: var(--borderThickness) 0 var(--borderThickness) 0;
}

.row:first-child,
.row:last-child {
  border-width: 0;
}

.tile {
  position: relative;
  width: v-bind(tileSize);
  height: v-bind(tileSize);

  background-color: var(--tileColor);
  border: var(--border) solid;
  border-width: var(--borderThickness);
}

/*vertical*/
.row td:nth-child(5n + 1),
.columnHead:nth-child(5n + 1) {
  border: var(--markerColor) solid;
  border-width: 0 var(--markerThickness) 0 0;
}

/*horizontal*/
.row:nth-child(5n + 1) {
  border: var(--markerColor) solid;
  border-width: 0 0 var(--markerThickness) 0;
  counter-increment: row 5;
}

/*counter numbers*/
.row:nth-child(5n + 1):after {
  right: 0;
  content: counter(row);
  color: var(--markerNumberColor);
  margin-left: var(--markerNumberMargin);
}

.selected {
  outline: inset var(--selectorOutline) 5px;
  outline-offset: -5px;
  transition: opacity 0.2s;
  z-index: 99;
}

.selectedTile {
  background-color: var(--selectorColor);
}

.tile:not(.clicked, .dragged):hover {
  background-color: var(--tileHover);
}

.hover {
  background-color: var(--tileHoverLight);
}

.dragFill {
  background-color: var(--dragFillColor);
}

.dragCross {
  background-color: var(--dragCrossColor);
}

.clicked {
  background-color: var(--tileFillColor);
}

.cross:before,
.wrong:before {
  position: absolute;
  top: 0;
  left: 0;

  margin: 10% 0 0 10%;

  width: 80%;
  height: 80%;
}

.cross:before {
  content: url('/cross.svg');
}

.wrong:before {
  content: url('/wrong.svg');
}

.fulfilled {
  color: var(--fulfilledColor);
}


</style>