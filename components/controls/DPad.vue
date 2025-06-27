<script setup lang="ts">
import type KeyboardControls from "~/components/controls/KeyboardControls";

const props = defineProps<{
  controls: KeyboardControls
}>()

function click(direction: string) {
  props.controls.directionInput(direction)
}

</script>

<template>
  <div id="dpad">

    <div id="center">
      <div id="drag"></div>
    </div>

    <div id="up" class="pad" @click="click('up')"></div>
    <div id="right" class="pad" @click="click('right')"></div>
    <div id="down" class="pad" @click="click('down')"></div>
    <div id="left" class="pad" @click="click('left')"></div>
  </div>

</template>

<style scoped>
#dpad {
  display: grid;

  grid-template-areas:
    ". up ."
    "left drag right"
    ". down .";

  grid-template-columns: 1fr 30% 1fr;
  grid-template-rows: 1fr 30% 1fr;

  max-width: 15rem;
  max-height: 15rem;

  width: 100%;
  height: 100%;

  filter: drop-shadow(10px 10px #013140);
}

.pad {
  background-color: #014357;
  border-radius: 15px;
  width: 100%;
  height: 100%;
}

#up {
  grid-area: up;
}

#down {
  grid-area: down;
}

#left {
  grid-area: left;
}

#right {
  grid-area: right;
}

#drag {
  width: 50%;
  height: 50%;
  background-color: #40bcf1;

  position: absolute;
  transform: translate(50%, 50%);
}

#center {
  position: relative;
  background-color: #1895c1;
  grid-area: drag;
  transform: rotate(45deg) scale(1.5);
  z-index: 0;
}

.pad:hover {
  background-color: #02637e;
}


</style>