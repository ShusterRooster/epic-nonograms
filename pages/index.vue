<script setup lang="ts">
import YAMLFileReader from "~/components/YAMLFileReader";

const route = useRoute()
const {data: page} = useAsyncData(route.path, () =>
    queryCollection('yaml').path('/big').first())

const fileReader = ref()

onMounted(async () => {
  fileReader.value = new YAMLFileReader(page.value)
  console.log(fileReader)
})

</script>

<template>
  <div id="container">
    <PuzzleTable v-if="fileReader" :file="fileReader"></PuzzleTable>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  justify-content: center;
  align-content: center;

  //width: 100vw;
  //height: 100vh;
}

</style>