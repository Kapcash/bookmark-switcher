<script setup>
import RouteWrapper from './RouteWrapper.vue'
import DevOnly from '@/components/DevOnly.vue'

const isDev = import.meta.env.NODE_ENV !== 'production'
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
