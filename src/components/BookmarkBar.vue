<template>
  <BookmarkBarView
    :name="name"
    :disabled="active"
    @edit="$emit('edit')"
    @select="$emit('select')"
  />
</template>

<script>
import BookmarkBarView from './BookmarkBarView.vue'

export default {
  name: 'BookmarkBar',
  components: { BookmarkBarView },
  emits: ['edit', 'select'],
  props: {
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
