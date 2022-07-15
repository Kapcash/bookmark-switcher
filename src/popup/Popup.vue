<template>
  <Suspense >
    <RouteWrapper />
    <template #fallback>
      Loading popup...
    </template>
  </Suspense>
  <!-- <DevOnly v-if="isDev" /> -->
</template>

<script>
import RouteWrapper from './RouteWrapper.vue'
// import DevOnly from '@/components/DevOnly.vue'

export default {
  name: 'Popup',
  components: { RouteWrapper },
  setup () {
    const isDev = process.env.NODE_ENV !== 'production'
    return {
      isDev,
    }
  },
}
</script>
