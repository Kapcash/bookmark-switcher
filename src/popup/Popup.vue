<template>
  <Suspense>
    <BarsList />
  </Suspense>
  <DevOnly v-if="isDev" />
</template>

<script>
import BarsList from '@/components/BarsList.vue'
import DevOnly from '@/components/DevOnly.vue'

export default {
  name: 'Popup',
  components: { BarsList, DevOnly },
  setup () {
    const isDev = process.env.NODE_ENV !== 'production'

    return { isDev }
  },
}
</script>

<style>
body {
  margin: 0;
  background-color: #444444;
}

body #app {
  min-width: 240px;
}

svg {
  fill: white;
}

.row {
  display: flex;
  justify-content: flex-end;
  height: 32px;
}

.flex {
  flex: 1 0 auto;
}

input {
  padding-left: 10px;
}
button, input {
  background-color: #222;
  color: white;
  border: 1px solid #444;
  outline: none;
}
button:disabled {
  color: #555;
}
button:disabled svg {
  fill: #555;
}
button:enabled {
  cursor: pointer;
}
button:hover:enabled {
  background-color: #333;
}

button.btn-icon {
  display: grid;
  place-content: center;
  padding: 0 5px;
}
</style>
