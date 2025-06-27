<script setup lang="ts">
import { z } from "zod/v4-mini"
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  setting: any;
}>()

const color = ref(props.setting.value)
const value = ref(color)

const schema = z.object({
  color: z.string(),
})

const state = reactive({
  color: color
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.color) errors.push({ name: 'color', message: 'Required' })
  if (!CSS.supports('color', state.color)) errors.push({ name: 'color', message: 'Invalid color' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  // toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  console.log(event.data)



}
</script>

<template>
  <div class="preview">
    <h1>{{ setting.name }}</h1>
    <h3>{{ setting.desc }}</h3>

    <UForm :schema="schema" :state="state" :validate="validate" class="space-y-4" @submit="onSubmit">
      <UFormField name="color">
        <UInput v-model="value" placeholder="Type something..." size="xl" :ui="{ trailing: 'pe-1' }"
          style="margin-top: 3rem">
          <template v-if="value != color">
            <UButton color="neutral" variant="link" size="sm" icon="la:undo-alt" aria-label="Reset changes"
              @click="value = color" />
          </template>

          <template v-if="value?.length" #trailing>
            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input"
              @click="value = ''" />
          </template>
        </UInput>
      </UFormField>

      <UButton type="submit">
        Submit
      </UButton>
    </UForm>


  </div>
</template>

<style scoped>
.preview {
  background-color: v-bind(color);
  border-radius: 25px;
  padding: 2rem;

  max-width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1,
h3 {
  color: v-bind(color);
  filter: invert(1) hue-rotate(40deg);
  box-shadow: 0 5px;
  margin: 0.5rem;
  text-align: center;
}
</style>
