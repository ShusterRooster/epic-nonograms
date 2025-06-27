<script setup lang="ts">
import SettingsReader from '~/components/SettingsReader';

onMounted(async () => {
  await nextTick()
  //await SettingsReader.checkCookies()
})
</script>

<template>
  <div>
    <NuxtPage/>
  </div>
</template>

<style>
@import "~/assets/style.css";

body {
  margin: 0;
}
</style>
