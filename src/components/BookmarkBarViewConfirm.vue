<template>
  <div>
    <BookmarkBarView v-show="!confirming" :name="name" :disabled="disabled" @edit="evt => $emit('edit', evt)" @select="evt => $emit('select', evt)" @remove="confirmEvent"/>
    <ConfirmBar v-show="confirming" @cancel="confirming = false" @validate="sendWaitingEvent" />
  </div>
</template>

<script>
import ConfirmBar from './ConfirmBar.vue'
import BookmarkBarView from './BookmarkBarView.vue'

export default {
  components: {
    ConfirmBar,
    BookmarkBarView
  },
  name: 'BookmarkBarViewConfirm',
  props: {
    name: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      confirming: false,
      waitingConfirmEvent: undefined
    }
  },
  methods: {
    confirmEvent (evt) {
      this.waitingConfirmEvent = evt
      this.confirming = true
    },
    sendWaitingEvent () {
      this.$emit('remove', this.waitingConfirmEvent)
    }
  }
}
</script>
