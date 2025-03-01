<script setup lang="ts">
import YAMLFileReader from "~/components/YAMLFileReader";

const route = useRoute()
const {data: page} = useAsyncData(route.path, () =>
    queryCollection('yaml').path(route.path).first())

const fileReader = ref()

onMounted(async () => {
  fileReader.value = new YAMLFileReader(page.value)
  console.log(fileReader)
})

</script>

<template>
  <div id="container">
    <div id="puzzle">
      <PuzzleTable v-if="fileReader" :file="fileReader"></PuzzleTable>
    </div>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  width: 100vw;
  height: 100vh;
}

#puzzle {
  margin: auto 0 auto;
}

</style>