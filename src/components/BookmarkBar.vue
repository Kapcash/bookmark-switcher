<template>
  <div>
    <BookmarkBarViewConfirm v-if="!isEditing" :name="barName" @edit="switchState" @select="selectBar" @remove="$emit('remove', barId)" :disabled="isCurrentToolbar" />
    <BookmarkBarEdit v-else :name="barName" @rename="updateName" @cancel="switchState" />
  </div>
</template>

<script>
import BookmarkBarViewConfirm from './BookmarkBarViewConfirm.vue'
import BookmarkBarEdit from './BookmarkBarEdit.vue'
import { updateBarName } from '@/bookmarkHelper'
import { switchToolbar, currentBookmarkFolderId } from '@/bookmarkState'

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
      isEditing: false
    }
  },
  computed: {
    isCurrentToolbar () {
      return this.barId === currentBookmarkFolderId.value
    }
  },
  methods: {
    selectBar () {
      return switchToolbar(this.barId)
    },
    switchState () {
      this.isEditing = !this.isEditing
    },
    updateName (newName) {
      this.isEditing = false
      updateBarName(this.barId, newName).then(() => {
        this.barName = newName
      })
    }
  }
}
</script>
