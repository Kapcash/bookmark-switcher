<template>
  <form class="row">
    <input v-model="barName" :placeholder="newBarPlaceholder" class="flex" />
    <button type="submit" :disabled="!barName" @click="addBar" >
      <!-- <svg height="16px" width="16px" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><path d="m408 184h-136c-4.417969 0-8-3.582031-8-8v-136c0-22.089844-17.910156-40-40-40s-40 17.910156-40 40v136c0 4.417969-3.582031 8-8 8h-136c-22.089844 0-40 17.910156-40 40s17.910156 40 40 40h136c4.417969 0 8 3.582031 8 8v136c0 22.089844 17.910156 40 40 40s40-17.910156 40-40v-136c0-4.417969 3.582031-8 8-8h136c22.089844 0 40-17.910156 40-40s-17.910156-40-40-40zm0 0"/></svg> -->
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="16px" width="16px">
        <path d="M492,236H276V20c0-11.046-8.954-20-20-20c-11.046,0-20,8.954-20,20v216H20c-11.046,0-20,8.954-20,20s8.954,20,20,20h216
            v216c0,11.046,8.954,20,20,20s20-8.954,20-20V276h216c11.046,0,20-8.954,20-20C512,244.954,503.046,236,492,236z"/>
      </svg>
    </button>
  </form>
</template>

<script>
import { ref } from 'vue'
import { createNewBar } from '@/bookmarkState'

export default {
  name: 'CreateBar',
  setup (props) {
    const barName = ref('')

    function addBar () {
      return createNewBar(this.barName).then((newBar) => {
        this.$emit('create', newBar)
      })
    }

    return {
      barName,
      addBar,
      newBarPlaceholder: browser.i18n.getMessage('newBarPlaceholder')
    }
  }
}
</script>
