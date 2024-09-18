<script setup>
import RouteWrapper from './RouteWrapper.vue'
import DevOnly from '@/components/DevOnly.vue'

const isDev = process.env.NODE_ENV !== 'production'
</script>

<template>
  <Suspense>
    <RouteWrapper />
    <template #fallback>
      Loading popup...
    </template>
  </Suspense>
  <DevOnly v-if="isDev" />
</template>

<style>
#app section + section {
  border-top: 1px solid #222;
  padding-top: 1px;
  margin-top: 1px;
}
#app input {
  padding-left: 10px;
}
</style>
