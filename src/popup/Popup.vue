<template>
  <Suspense>
    <RouteWrapper />
    <template #fallback>
      Loading popup...
    </template>
  </Suspense>
  <DevOnly v-if="isDev" />
</template>

<script setup>
import RouteWrapper from './RouteWrapper.vue'
import DevOnly from '@/components/DevOnly.vue'

const isDev = process.env.NODE_ENV !== 'production'
</script>
