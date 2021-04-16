<template>
  <Suspense>
    <BarsList />
  </Suspense>
</template>

<script>
import BarsList from './BarsList.vue'

export default {
  name: 'Popup',
  components: {
    BarsList
  }
}
</script>

<style>
body {
  background-color: #444444;
  margin: -1px;
}

svg {
  fill: white;
}

.row {
  display: flex;
  justify-content: space-between;
  height: 32px;
}

.flex {
  flex: 1 0 auto;
}

button, input {
  background-color: #222;
  color: white;
  border: 1px solid #444;
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
}
</style>
