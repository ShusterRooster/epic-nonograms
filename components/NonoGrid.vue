<script setup lang="ts">
import YAMLFileReader from "~/components/YAMLFileReader";
import Konva from "konva";

const props = defineProps<{
  file: YAMLFileReader
}>()

const route = useRoute()
const {data: page} = useAsyncData(route.path, () =>
    queryCollection('yaml').path(route.path).first())

const fileReader = ref()

onMounted(async () => {
  fileReader.value = new YAMLFileReader(page.value)
})

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

const startX = 20
const startY = 20

const getTileConfig = (col: number, row: number) => {
  return ref({
    width: 20,
    height: 20,
    stroke: 'black',
    strokeWidth: 2,
    x: startX + (col * startX),
    y: startY + (row * startY),
  })
}

const stage = new Konva.Stage({
  container: 'container',

})
</script>

<template>
  <client-only>
    <div id="container">
      <v-stage :config="configKonva">

        <v-layer>
          <div v-for="(row) in props.file.height">

            <v-rect v-for="(col) in props.file.width" :config="getTileConfig(col, row)"/>

          </div>
        </v-layer>

      </v-stage>
    </div>

  </client-only>
</template>

<style scoped>

</style>
