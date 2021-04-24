<template>
  <Suspense>
    <BarsList />
  </Suspense>
</template>

<script>
import BarsList from '@/components/BarsList.vue'

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
  overflow: hidden;
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
}
</style>
