<script setup lang="ts">

const theme = useCookie('theme').value!
</script>

<template>
  <div id="container">
    <div v-for="setting in theme" class="setting">
      <colorPreview :setting="setting"></colorPreview>
    </div>
  </div>
</template>

<style scoped>
.setting {
  margin: 3rem;
}

#container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-flow: row dense;
  padding: 3rem;
  background-color: var(--guiColor);
}
</style>
