<template>
  <form class="row">
    <input v-model="barName">
    <input type="submit" value="Update" @click="$emit('rename', barName)">
  </form>
</template>

<script>
export default {
  name: 'BookmarkBarEdit',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      barName: this.name
    }
  }
}
</script>
