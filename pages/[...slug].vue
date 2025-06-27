<script setup lang="ts">
import YAMLFileReader from "~/components/YAMLFileReader";
import NonoGrid from "~/components/NonoGrid.vue";

const route = useRoute()
const {data: page} = useAsyncData(route.path, () =>
    queryCollection('yaml').path(route.path).first())

const fileReader = ref()

onMounted(async () => {
  fileReader.value = new YAMLFileReader(page.value)
})
</script>

<template>
  <div id="container">
    <NonoGrid :file="fileReader"/>
  </div>
</template>

<style scoped>
#container {
  width: 100vw;
  height: 100vh;
}
</style>
