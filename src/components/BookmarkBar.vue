<template>
  <div>
    <BookmarkBarViewConfirm v-if="!isEditing" :name="barName" @edit="switchState" @select="$emit('select', barId)" @remove="$emit('remove', barId)" :disabled="active" />
    <BookmarkBarEdit v-else :name="barName" @rename="updateName" @cancel="switchState" />
  </div>
</template>

<script>
import BookmarkBarViewConfirm from './BookmarkBarViewConfirm.vue'
import BookmarkBarEdit from './BookmarkBarEdit.vue'
import { updateBarName } from '@/bookmarkHelper'

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
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      barName: this.name,
      isEditing: false
    }
  },
  methods: {
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
