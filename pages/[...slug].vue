<script setup lang="ts">
import YAMLFileReader from "~/components/YAMLFileReader";
import DPad from "~/components/DPad.vue";
import type DesktopControls from "~/components/DesktopControls";

const route = useRoute()
const {data: page} = useAsyncData(route.path, () =>
    queryCollection('yaml').path(route.path).first())

const cross = ref()
const fill = ref()
const fileReader = ref()

onMounted(async () => {
  fileReader.value = new YAMLFileReader(page.value)
})

const controls = ref()
let game: DesktopControls

function initGame(logic: DesktopControls) {
  controls.value = logic
  logic.crossButton = cross.value
  logic.fillButton = fill.value
  game = logic
}

function buttonClick(action: string) {
  if(!game.previousSelector) {

  }
  game.selectorAction(action)
}
</script>

<template>
  <div id="container">
    <div id="gui"></div>

    <div id="puzzle">
      <PuzzleTable v-if="fileReader" :file="fileReader" @ready="initGame"></PuzzleTable>
    </div>

    <div id="controls">

      <div id="buttons">
        <input ref="fill" id="fill" class="button" type="radio" name="button" @click="buttonClick('fill')" checked>
        <input ref="cross" id="cross" class="button" type="radio" name="button" @click="buttonClick('cross')">
      </div>

      <DPad :controls="controls" style="grid-area: dpad"></DPad>

    </div>

  </div>
</template>

<style scoped>
@import "~/assets/style.css";

.button {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  border-radius: 20px;
  background-color: var(--buttonColor);

  filter: drop-shadow(15px 15px var(--buttonShadow));

  display: flex;
  align-items: center;
  justify-content: center;
}

input {
  cursor: pointer;
  appearance: none;
}

.button * {
  width: 50%;
}

.button:hover {
  background-color: #c5d1e4;
}

.button:checked, .button:active {
  transform: translate(10px, 10px);
  filter: drop-shadow(8px 8px var(--buttonShadow));
  background-color: var(--buttonActive);
}

.button:before {
  position: absolute;
  top: 0;
  left: 0;

  margin: 10% 0 0 10%;

  width: 80%;
  height: 80%;
}

#cross:before {
  content: url('~/assets/cross.svg');
}

#fill:before {
  content: url('~/assets/square.svg');
}


#container {
  display: grid;

  grid-template-columns: 3rem 60% 1fr;
  grid-template-rows: 100%;

  grid-template-areas:
  "gui puzzle controls";

  align-items: center;
  justify-content: flex-start;

  max-width: 100vw;
  max-height: 100vh;

  height: 100%;
  width: 100%;
}

#gui {
  grid-area: gui;
  left: 0;
  top: 0;

  height: 100%;
  width: 100%;

  background-color: var(--guiColor);
}

#controls {
  grid-area: controls;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: "buttons buttons dpad";

  aspect-ratio: 3;

  width: 100%;
}

#buttons {
  grid-area: buttons;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3rem 3rem 3rem 0;
  grid-gap: 3rem;

  box-sizing: content-box;
}

#puzzle {
  grid-area: puzzle;
  display: flex;
  justify-content: center;
}

</style>