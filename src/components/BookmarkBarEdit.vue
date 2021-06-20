<template>
  <form class="row">
    <input ref="bookmark-name-input" v-model="barName">
    <button type="submit" class="btn-icon" @click="$emit('rename', barName)">{{ updateBtn }}</button>
    <button :title="cancelTooltip" class="btn-icon" @click="$emit('cancel')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 512 512">
        <path d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717    L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859    c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287    l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285    L284.286,256.002z" data-original="#000000" style="" class=""/>
      </svg>
    </button>
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
      barName: this.name,
      cancelTooltip: browser.i18n.getMessage('cancel'),
      updateBtn: browser.i18n.getMessage('update')
    }
  },
  mounted () {
    this.$refs['bookmark-name-input'].focus()
  }
}
</script>

<style scoped>
input {
  width: 0;
  min-width: 0;
  flex: 1 1 auto;
}
</style>
