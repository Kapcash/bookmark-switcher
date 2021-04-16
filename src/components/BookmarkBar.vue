<template>
  <div>
    <BookmarkBarView v-show="!editing" :name="barName" @edit="rename" @select="selectBar" @remove="$emit('remove', barId)" :disabled="isCurrentToolbar" />
    <BookmarkBarEdit v-show="editing" :name="barName" @rename="updateName" />
  </div>
</template>

<script>
import BookmarkBarView from './BookmarkBarView.vue'
import BookmarkBarEdit from './BookmarkBarEdit.vue'
import { updateBarName, switchToolbar, CURRENT_BOOKMARK_FOLDER_ID } from '@/components/bookmarkHelper'

export default {
  name: 'BookmarkBar',
  components: { BookmarkBarView, BookmarkBarEdit },
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
    async selectBar () {
      return switchToolbar(this.barId)
    },
    rename () {
      this.editing = true
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
