<template>
  <div>
    <BookmarkBarViewConfirm v-show="!editing" :name="barName" @edit="switchState" @select="selectBar" @remove="$emit('remove', barId)" :disabled="isCurrentToolbar" />
    <BookmarkBarEdit v-show="editing" :name="barName" @rename="updateName" @cancel="switchState" />
  </div>
</template>

<script>
import BookmarkBarViewConfirm from './BookmarkBarViewConfirm.vue'
import BookmarkBarEdit from './BookmarkBarEdit.vue'
import { updateBarName } from '@/bookmarkHelper'
import { switchToolbar, CURRENT_BOOKMARK_FOLDER_ID } from '@/bookmarkState'

export default {
  name: 'BookmarkBar',
  components: { BookmarkBarViewConfirm, BookmarkBarEdit },
  props: {
    name: {
      type: String,
      required: true
    },
    barId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      barName: this.name,
      editing: false
    }
  },
  computed: {
    isCurrentToolbar () {
      return this.barId === CURRENT_BOOKMARK_FOLDER_ID.value
    }
  },
  methods: {
    selectBar () {
      return switchToolbar(this.barId)
    },
    switchState () {
      this.editing = !this.editing
    },
    updateName (newName) {
      this.editing = false
      updateBarName(this.barId, newName).then(() => {
        this.barName = newName
      })
    }
  }
}
</script>
