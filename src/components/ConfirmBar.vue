<template>
  <div class="row">
    <button :title="validateTooltip" class="btn-icon" @click="$emit('validate')">
      <svg viewBox="0 -65 434.67733 434" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg">
        <path d="m152.003906 304.34375c-5.460937 0-10.921875-2.089844-15.082031-6.25l-130.664063-130.667969c-8.34375-8.339843-8.34375-21.824219 0-30.164062 8.339844-8.339844 21.820313-8.339844 30.164063 0l115.582031 115.582031 246.253906-246.25c8.339844-8.339844 21.820313-8.339844 30.164063 0 8.339844 8.34375 8.339844 21.824219 0 30.167969l-261.332031 261.332031c-4.160156 4.160156-9.625 6.25-15.085938 6.25zm0 0"/>
      </svg>
    </button>
    <button :title="cancelTooltip" class="btn-icon" @click="$emit('cancel')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 512 512">
        <path d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717    L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859    c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287    l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285    L284.286,256.002z" data-original="#000000" style="" class=""/>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ConfirmBar',
  data () {
    return {
      validateTooltip: browser.i18n.getMessage('validate'),
      cancelTooltip: browser.i18n.getMessage('cancel'),
    }
  },
}
</script>

<style scoped>
.row .btn-icon {
  flex: 1 1 auto;
}
</style>
