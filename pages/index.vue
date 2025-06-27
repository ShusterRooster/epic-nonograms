<template>
  <client-only>
    <v-stage :config="configKonva">
      <v-layer>
        <v-circle :config="configCircle"/>
      </v-layer>
    </v-stage>
  </client-only>
</template>

<script lang="ts" setup>
const configKonva = ref({
  width: 1000,
  height: 1000,
})

onMounted(async () => {
  configKonva.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
})

const tileConfig = ref({
  width: 20,
  height: 20,
  stroke: 'black',
  strokeWidth: 2
})

// Circle configuration
const configCircle = ref({
  x: 200,
  y: 200,
  radius: 50,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 4,
  draggable: true
})
</script>